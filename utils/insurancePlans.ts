export interface InsurancePlan {
    id: string;
    name: string;
    provider: string;
    category: 'Health' | 'Fire' | 'Vehicle' | 'Property';
    basePrice: number;
    price: number; // basePrice + 20%
    currency: string;
}

const applyMarkup = (base: number) => base * 1.2;

export const insurancePlans: InsurancePlan[] = [
    // Health (Based on AXA Mansard, MyCoverGenius, Bastion, Reliance, Clearline)
    { id: 'health_1', name: 'FlexiCare Health Plan', provider: 'MyCoverGenius', category: 'Health', basePrice: 48000, price: applyMarkup(48000), currency: 'NGN/yr' }, // 4000/mo
    { id: 'health_2', name: 'Bastion Basic Care', provider: 'Bastion Health', category: 'Health', basePrice: 30628, price: applyMarkup(30628), currency: 'NGN/yr' },
    { id: 'health_3', name: 'Clearline Kia Kia', provider: 'Clearline HMO', category: 'Health', basePrice: 36000, price: applyMarkup(36000), currency: 'NGN/yr' }, // 3000/mo
    { id: 'health_4', name: 'Well Health Basic', provider: 'Well Health Network', category: 'Health', basePrice: 18500, price: applyMarkup(18500), currency: 'NGN/yr' },
    { id: 'health_5', name: 'AXA EasyCare Plus', provider: 'AXA Mansard', category: 'Health', basePrice: 32000, price: applyMarkup(32000), currency: 'NGN/yr' },
    { id: 'health_6', name: 'Reliance Basic', provider: 'Reliance HMO', category: 'Health', basePrice: 42500, price: applyMarkup(42500), currency: 'NGN/yr' },
    { id: 'health_7', name: 'HyEase Health Cover', provider: 'Hygeia HMO', category: 'Health', basePrice: 26515, price: applyMarkup(26515), currency: 'NGN/yr' },

    // Vehicle (Based on Heirs Insurance, MyCoverGenius standard auto rates)
    { id: 'veh_1', name: 'Third-Party Motor Insurance', provider: 'Heirs Insurance Group', category: 'Vehicle', basePrice: 15000, price: applyMarkup(15000), currency: 'NGN/yr' },
    { id: 'veh_2', name: 'Flexi Comprehensive Auto', provider: 'Heirs Insurance Group', category: 'Vehicle', basePrice: 25000, price: applyMarkup(25000), currency: 'NGN/yr' },
    { id: 'veh_3', name: 'Standard Third-Party Auto', provider: 'MyCoverGenius', category: 'Vehicle', basePrice: 15000, price: applyMarkup(15000), currency: 'NGN/yr' },
    { id: 'veh_4', name: 'Comprehensive Auto (Value 3M)', provider: 'AXA Mansard Auto', category: 'Vehicle', basePrice: 90000, price: applyMarkup(90000), currency: 'NGN/yr' }, // ~3% of 3M
    { id: 'veh_5', name: 'Comprehensive Auto (Value 5M)', provider: 'Leadway Assurance', category: 'Vehicle', basePrice: 150000, price: applyMarkup(150000), currency: 'NGN/yr' },

    // Fire & Property (Based on Prestige Assurance Fire and Allied Perils, standard market rates)
    { id: 'fire_1', name: 'Basic Fire & Allied Perils', provider: 'Prestige Assurance PLC', category: 'Fire', basePrice: 25000, price: applyMarkup(25000), currency: 'NGN/yr' },
    { id: 'fire_2', name: 'Comprehensive Fire & Strike Cover', provider: 'Prestige Assurance PLC', category: 'Fire', basePrice: 45000, price: applyMarkup(45000), currency: 'NGN/yr' },
    { id: 'fire_3', name: 'Homeowners Fire Protection', provider: 'Leadway Assurance', category: 'Fire', basePrice: 30000, price: applyMarkup(30000), currency: 'NGN/yr' },
    { id: 'prop_1', name: 'Standard Property Insurance', provider: 'AIICO Insurance', category: 'Property', basePrice: 50000, price: applyMarkup(50000), currency: 'NGN/yr' },
    { id: 'prop_2', name: 'Premium Estate Cover', provider: 'Custodian & Allied', category: 'Property', basePrice: 120000, price: applyMarkup(120000), currency: 'NGN/yr' },
    { id: 'prop_3', name: 'Small Business Property Cover', provider: 'NEM Insurance', category: 'Property', basePrice: 65000, price: applyMarkup(65000), currency: 'NGN/yr' },
    { id: 'prop_4', name: 'Renter’s Belongings Insurance', provider: 'Cornerstone Insurance', category: 'Property', basePrice: 15000, price: applyMarkup(15000), currency: 'NGN/yr' },
    { id: 'prop_5', name: 'Commercial Building Policy', provider: 'FBN General Insurance', category: 'Property', basePrice: 200000, price: applyMarkup(200000), currency: 'NGN/yr' }
];