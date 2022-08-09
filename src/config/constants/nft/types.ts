export enum NFTGrade {
    CLEANER = 'Cleaner',
    CASHIER = 'Cashier',
    CUSTOMER_SERVICE = 'Customer Service',
    ACCOUNTING = 'Accounting',
    MANAGER = 'Manager',
    CEO = "CEO"
}

export enum SignatureGrade {
    CLEANER = 'Cleaner',
    CASHIER = 'Cashier',
    CUSTOMER_SERVICE = 'Customer Service',
    ACCOUNTING = 'Accounting',
    MANAGER = 'Manager'
}

export interface NFTGradeConfig {
    grade: NFTGrade|SignatureGrade
    level: number
    image: string
    qualityMin: number
    qualityMax: number
}