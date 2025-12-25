export const COMPANY_REGISTRY_ADDRESS = '0x62718B8442AE19EE2F86DE9A6B07714b5A0Ed765';
export const PAYROLL_MANAGER_ADDRESS = '0xbDb0A01528D744045e24ACb5E63559DE3d1B6Bba';

export const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
export const EURC_ADDRESS = '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a';

export enum PayCycle {
    Monthly = 0,
    Weekly = 1,
    BiWeekly = 2,
    Quarterly = 3,
}

export const PAY_CYCLE_LABELS = {
    [PayCycle.Monthly]: 'Monthly',
    [PayCycle.Weekly]: 'Weekly',
    [PayCycle.BiWeekly]: 'Bi-Weekly',
    [PayCycle.Quarterly]: 'Quarterly',
};
