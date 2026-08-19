import { AuditLog } from "#root/interfaces";
import { LogDialogStateEnum } from "#root/interfaces/dialog";

export interface LogDialogProps {
    stateKey: LogDialogStateEnum;
    getLogs: (v?: { [key: string]: string }) => Promise<AuditLog[]>;
    title: string;
    subtitle?: string;
}
