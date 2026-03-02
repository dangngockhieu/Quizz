import { Role } from '../../help/constant';
export interface UserAccount{
    id: number,
    code: string,
    fullName: string,
    role: Role
}