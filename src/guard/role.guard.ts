import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserService } from "src/user/user.service";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class RoleGuard implements CanActivate{
    constructor(private reflector: Reflector, private authService: AuthService, private userService: UserService){}
    //A service that allows access to metadata attached to route handlers (such as the roles allowed to access a route)

    async canActivate(context: ExecutionContext):Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler()); // The roles variables retrieve the roles
        //meta data attached to the route handler (the function that will handle the request).
        // console.log('roles', roles);

        const request = context.switchToHttp().getRequest();
        // The request object represents the incoming HTTP request. It contains information like headers, the current user and other request-related data.

        if(request?.user){
            // Use the user object already attached to the request
            const user = request.user;
            // The code fetches the user object from the request, which should contain the current user's details, such as their role.

            if(!roles.includes(user.role)) {
                throw new ForbiddenException(roles.join(' or '))
            }
            return true; // The line checks if the user's role (retrieved from the request) is included in the list of roles allowed to access this route
        }
        return false;
        // If the user's role is not in the list, it throws a ForbiddenRoleException, effectively denying access to the route
    }
}