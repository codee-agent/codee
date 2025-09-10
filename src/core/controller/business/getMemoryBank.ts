import { EmptyRequest } from "@/generated/nice-grpc/cline/common"
import { Controller } from ".."
import { Boolean } from "@/shared/proto/cline/common"
import { hasMemoryBank } from "@/core/storage/disk"

export async function getMemoryBank(_controller: Controller, _: EmptyRequest): Promise<Boolean> {
	return { value: await hasMemoryBank() }
}
