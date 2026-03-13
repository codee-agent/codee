import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { Mutex } from 'async-mutex';

// 创建全局互斥锁映射
const mutexMap = new Map<string, Mutex>();

// 获取或创建互斥锁
function getMutex(binaryPath: string): Mutex {
	if (!mutexMap.has(binaryPath)) {
		mutexMap.set(binaryPath, new Mutex());
	}
	return mutexMap.get(binaryPath)!;
}

// 检查进程是否运行
function isProcessRunning(pid: number): boolean {
	try {
		// 发送信号0来检查进程是否存在
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return false;
	}
}

// 通过二进制路径查找进程
function findProcessByBinaryPath(binaryPath: string): number | null {
	try {
		let command: string;
		let output: string;

		if (os.platform() === 'win32') {
			// Windows 使用 wmic
			command = `wmic process where "commandline like '%${binaryPath.replace(/\\/g, '\\\\')}%'" get processid`;
			output = execSync(command, { encoding: 'utf8' });

			const lines = output.trim().split('\r\n').slice(1);
			for (const line of lines) {
				const pid = parseInt(line.trim());
				if (!isNaN(pid) && pid > 0) {
					return pid;
				}
			}
		} else {
			// Unix/Linux/Mac 使用 ps
			command = `ps aux | grep "${binaryPath}" | grep -v grep`;
			output = execSync(command, { encoding: 'utf8' });

			const lines = output.trim().split('\n');
			for (const line of lines) {
				const parts = line.trim().split(/\s+/);
				if (parts.length > 1) {
					const pid = parseInt(parts[1]);
					if (!isNaN(pid) && pid > 0) {
						return pid;
					}
				}
			}
		}
		return null;
	} catch (error) {
		return null;
	}
}

// 使用锁文件管理进程
function getLockFilePath(binaryPath: string, lockDir?: string): string {
	const dir = lockDir || os.tmpdir();
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	const safeName = path.basename(binaryPath).replace(/[^a-zA-Z0-9]/g, '_');
	return path.join(dir, `${safeName}.pid`);
}

// 获取引用计数文件路径
function getRefCountFilePath(binaryPath: string, lockDir?: string): string {
	const dir = lockDir || os.tmpdir();
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	const safeName = path.basename(binaryPath).replace(/[^a-zA-Z0-9]/g, '_');
	return path.join(dir, `${safeName}.refcount`);
}

// 读取引用计数
function readRefCount(refCountFilePath: string): number {
	if (!fs.existsSync(refCountFilePath)) {
		return 0;
	}
	try {
		const countStr = fs.readFileSync(refCountFilePath, 'utf8').trim();
		const count = parseInt(countStr);
		return isNaN(count) ? 0 : count;
	} catch (error) {
		return 0;
	}
}

// 写入引用计数
function writeRefCount(refCountFilePath: string, count: number): void {
	try {
		fs.writeFileSync(refCountFilePath, count.toString());
	} catch (error) {
		console.log('无法写入引用计数文件:', error);
	}
}

// 增加引用计数
async function incrementRefCount(binaryPath: string, lockDir?: string): Promise<number> {
	const mutex = getMutex(binaryPath);
	const release = await mutex.acquire();
	
	try {
		const refCountFilePath = getRefCountFilePath(binaryPath, lockDir);
		const currentCount = readRefCount(refCountFilePath);
		const newCount = currentCount + 1;
		writeRefCount(refCountFilePath, newCount);
		return newCount;
	} finally {
		release();
	}
}

// 减少引用计数
async function decrementRefCount(binaryPath: string, lockDir?: string): Promise<number> {
	const mutex = getMutex(binaryPath);
	const release = await mutex.acquire();
	
	try {
		const refCountFilePath = getRefCountFilePath(binaryPath, lockDir);
		const currentCount = readRefCount(refCountFilePath);
		const newCount = Math.max(0, currentCount - 1);
		writeRefCount(refCountFilePath, newCount);
		
		// 如果计数为0，删除引用计数文件
		if (newCount === 0 && fs.existsSync(refCountFilePath)) {
			try {
				fs.unlinkSync(refCountFilePath);
			} catch (error) {
				// 忽略错误
			}
		}
		
		return newCount;
	} finally {
		release();
	}
}

function checkProcessByLockFile(lockFilePath: string): number | null {
	if (!fs.existsSync(lockFilePath)) {
		return null;
	}

	try {
		const pidStr = fs.readFileSync(lockFilePath, 'utf8').trim();
		const pid = parseInt(pidStr);

		if (isNaN(pid) || pid <= 0) {
			return null;
		}

		if (isProcessRunning(pid)) {
			return pid;
		} else {
			// 进程不存在，删除无效的锁文件
			fs.unlinkSync(lockFilePath);
			return null;
		}
	} catch (error) {
		return null;
	}
}

// 进程信息接口
export interface ProcessInfo {
	pid: number;
	kill: () => Promise<void>;
	alreadyRunning: boolean;
	stdoutLog?: string;
	stderrLog?: string;
  cwd?: string
}

// 启动后台进程
export async function startBackgroundProcess(
	binaryPath: string,
	args: string[] = [],
	options: {
		lockDir?: string;
		logDir?: string;
		stdoutLog?: boolean;
		stderrLog?: boolean;
    cwd?: string
	} = {}
): Promise<ProcessInfo> {
	const {
		lockDir,
		logDir,
		stdoutLog = false,
		stderrLog = false,
    cwd
	} = options;

	const lockFilePath = getLockFilePath(binaryPath, lockDir);

	// 首先检查锁文件
	const lockedPid = checkProcessByLockFile(lockFilePath);
	if (lockedPid !== null) {
		// 增加引用计数
		const refCount = await incrementRefCount(binaryPath, lockDir);
		console.log(`进程已存在 (锁文件)，PID: ${lockedPid}，引用计数: ${refCount}`);
		return {
			pid: lockedPid,
			kill: async () => {
				const currentRefCount = await decrementRefCount(binaryPath, lockDir);
				if (currentRefCount === 0) {
					try {
						process.kill(-lockedPid);
						fs.unlinkSync(lockFilePath);
					} catch (error) {
						// 忽略错误
					}
				}
			},
			alreadyRunning: true
		};
	}

	// 然后检查进程列表
	const existingPid = findProcessByBinaryPath(binaryPath);
	if (existingPid !== null && isProcessRunning(existingPid)) {
		// 更新锁文件
		fs.writeFileSync(lockFilePath, existingPid.toString());
		// 增加引用计数
		const refCount = await incrementRefCount(binaryPath, lockDir);
		console.log(`进程已存在 (进程列表)，PID: ${existingPid}，引用计数: ${refCount}`);
		return {
			pid: existingPid,
			kill: async () => {
				const currentRefCount = await decrementRefCount(binaryPath, lockDir);
				if (currentRefCount === 0) {
					try {
						process.kill(-existingPid);
						fs.unlinkSync(lockFilePath);
					} catch (error) {
						// 忽略错误
					}
				}
			},
			alreadyRunning: true
		};
	}
	// 启动新进程
	return new Promise(async (resolve, reject) => {
		// 创建日志目录
		const safeName = path.basename(binaryPath).replace(/[^a-zA-Z0-9]/g, '_');
		let stdoutStream: fs.WriteStream | 'ignore' = 'ignore';
		let stderrStream: fs.WriteStream | 'ignore' = 'ignore';

		if (logDir && !fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
			const stdoutLogPath = path.join(logDir, `${safeName}.out.log`);
			const stderrLogPath = path.join(logDir, `${safeName}.err.log`);

			if (stdoutLog) {
				stdoutStream = fs.createWriteStream(stdoutLogPath, { flags: 'a' });
			}
			if (stderrLog) {
				stderrStream = fs.createWriteStream(stderrLogPath, { flags: 'a' });
			}
		}

		const spawnOptions: any = {
			detached: true,
      cwd: cwd,
			stdio: ['ignore', stdoutStream, stderrStream]
		};

		if (os.platform() === 'win32') {
			spawnOptions.windowsHide = true;
		}
		const child = spawn(binaryPath, args, spawnOptions);
    child.unref();
		// 检查 child.pid 是否定义
		if (child.pid === undefined) {
			// 关闭日志流
			if (stdoutStream !== 'ignore') {
				(stdoutStream as fs.WriteStream).end();
			}
			if (stderrStream !== 'ignore') {
				(stderrStream as fs.WriteStream).end();
			}
			reject(new Error('Failed to start process: child.pid is undefined'));
			return;
		}

		const pid = child.pid; // 保存到变量中，避免重复检查

		child.on('error', (error) => {
			// 关闭日志流
			if (stdoutStream !== 'ignore') {
				(stdoutStream as fs.WriteStream).end();
			}
			if (stderrStream !== 'ignore') {
				(stderrStream as fs.WriteStream).end();
			}
			// 删除锁文件
			if (fs.existsSync(lockFilePath)) {
				fs.unlinkSync(lockFilePath);
			}
			reject(error);
		});

		// 创建锁文件
		try {
			fs.writeFileSync(lockFilePath, pid.toString());
			// 初始化引用计数为1
			await incrementRefCount(binaryPath, lockDir);
		} catch (error) {
			console.log('无法创建锁文件:', error);
		}

		setTimeout(async () => {
			// 添加健康检查，确保Qdrant真正可用
			let attempts = 0;
			const maxAttempts = 15;
			const healthCheckDelay = 2000;
			
			while (attempts < maxAttempts) {
				try {
					// 尝试连接到Qdrant的默认端口，使用AbortController实现超时
					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), 5000);
					
					const response = await fetch('http://localhost:6333/', {
						method: 'GET',
						signal: controller.signal
					});
					
					clearTimeout(timeoutId);
					
					if (response.ok) {
						console.log(`Qdrant health check passed after ${attempts + 1} attempts`);
						resolve({
							pid: pid,
							kill: async () => {
								const currentRefCount = await decrementRefCount(binaryPath, lockDir);
								if (currentRefCount === 0) {
									try {
										process.kill(-pid);
									} catch (error) {
										// 进程可能已经退出
									}
									// 关闭日志流
									if (stdoutStream !== 'ignore') {
										(stdoutStream as fs.WriteStream).end();
									}
									if (stderrStream !== 'ignore') {
										(stderrStream as fs.WriteStream).end();
									}
									// 删除锁文件
									if (fs.existsSync(lockFilePath)) {
										fs.unlinkSync(lockFilePath);
									}
								}
							},
							alreadyRunning: false,
							stdoutLog: undefined,
							stderrLog: undefined
						});
						return;
					}
				} catch (error) {
					console.log(`Qdrant health check attempt ${attempts + 1} failed:`, error.message);
				}
				attempts++;
				await new Promise(resolve => setTimeout(resolve, healthCheckDelay));
			}
			
			// 超时处理
			const error = new Error('Qdrant failed to start within expected time (30 seconds)');
			console.error('Qdrant startup timeout:', error.message);
			
			// 清理资源
			if (stdoutStream !== 'ignore') {
				(stdoutStream as fs.WriteStream).end();
			}
			if (stderrStream !== 'ignore') {
				(stderrStream as fs.WriteStream).end();
			}
			if (fs.existsSync(lockFilePath)) {
				fs.unlinkSync(lockFilePath);
			}
			
			reject(error);
		}, 3000);
	});
}

// 停止进程
export async function stopBackgroundProcess(
	binaryPath: string,
	options: {
		lockDir?: string;
	} = {}
): Promise<boolean> {
	const { lockDir } = options;
	const lockFilePath = getLockFilePath(binaryPath, lockDir);

	try {
		// 减少引用计数
		const currentRefCount = await decrementRefCount(binaryPath, lockDir);
		
		// 只有当引用计数为0时才真正停止进程
		if (currentRefCount === 0) {
			// 首先检查锁文件
			const lockedPid = checkProcessByLockFile(lockFilePath);
			if (lockedPid !== null) {
				process.kill(-lockedPid);
				fs.unlinkSync(lockFilePath);
				return true;
			}

			// 然后检查进程列表
			const existingPid = findProcessByBinaryPath(binaryPath);
			if (existingPid !== null && isProcessRunning(existingPid)) {
				process.kill(-existingPid);
				if (fs.existsSync(lockFilePath)) {
					fs.unlinkSync(lockFilePath);
				}
				return true;
			}
		} else {
			console.log(`进程引用计数减至 ${currentRefCount}，不停止进程`);
		}

		return false;
	} catch (error) {
		console.error('停止进程失败:', error);
		return false;
	}
}

// 检查进程状态
export async function checkProcessStatus(
	binaryPath: string,
	options: {
		lockDir?: string;
	} = {}
): Promise<{ running: boolean; pid?: number; source?: 'lockfile' | 'processlist' }> {
	const { lockDir } = options;
	const lockFilePath = getLockFilePath(binaryPath, lockDir);

	// 首先检查锁文件
	const lockedPid = checkProcessByLockFile(lockFilePath);
	if (lockedPid !== null) {
		return { running: true, pid: lockedPid, source: 'lockfile' };
	}

	// 然后检查进程列表
	const existingPid = findProcessByBinaryPath(binaryPath);
	if (existingPid !== null && isProcessRunning(existingPid)) {
		return { running: true, pid: existingPid, source: 'processlist' };
	}

	return { running: false };
}

// 清理所有锁文件
export function cleanupLockFiles(binaryPath: string, options: {
	lockDir?: string;
} = {}): void {
	const { lockDir } = options;
	const lockFilePath = getLockFilePath(binaryPath, lockDir);
	const refCountFilePath = getRefCountFilePath(binaryPath, lockDir);

	if (fs.existsSync(lockFilePath)) {
		try {
			fs.unlinkSync(lockFilePath);
		} catch (error) {
			// 忽略错误
		}
	}
	
	if (fs.existsSync(refCountFilePath)) {
		try {
			fs.unlinkSync(refCountFilePath);
		} catch (error) {
			// 忽略错误
		}
	}
}
