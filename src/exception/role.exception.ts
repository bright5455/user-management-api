import { ForbiddenException } from "@nestjs/common";

export class ForbiddenRoleException extends ForbiddenException {
    constructor(role: string) {
        super(`You do not have the required role ${role}`);
    }
}
