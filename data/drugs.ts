export interface Drug {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export const DRUGS: Drug[] = [
  {
    id: 'amoxicillin',
    name: 'Amoxicillin 500mg',
    description: 'Antibiotic used to treat a wide variety of bacterial infections.',
    imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=800' // Generic capsules
  },
  {
    id: 'paracetamol',
    name: 'Paracetamol 500mg',
    description: 'Common pain reliever and fever reducer.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800' // White pills
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen 400mg',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID).',
    imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80&w=800' // Red/Orange pills
  },
  {
    id: 'ciprofloxacin',
    name: 'Ciprofloxacin 500mg',
    description: 'Antibiotic used to treat different types of bacterial infections.',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=800' // White tablets
  },
  {
    id: 'metformin',
    name: 'Metformin 500mg',
    description: 'First-line medication for the treatment of type 2 diabetes.',
    imageUrl: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?auto=format&fit=crop&q=80&w=800' // White round pills
  },
  {
    id: 'amlodipine',
    name: 'Amlodipine 5mg',
    description: 'Medication used to treat high blood pressure and coronary artery disease.',
    imageUrl: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=800' // Heart medication concept
  },
  {
    id: 'azithromycin',
    name: 'Azithromycin 250mg',
    description: 'Antibiotic used for the treatment of a number of bacterial infections.',
    imageUrl: 'https://images.unsplash.com/photo-1550572017-4fcdbb560207?auto=format&fit=crop&q=80&w=800' // Pink pills
  },
  {
      id: 'lisinopril',
      name: 'Lisinopril 10mg',
      description: 'Medication of the angiotensin-converting enzyme (ACE) inhibitor class used to treat high blood pressure.',
      imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800' // Pharmacy shelf generic
  }
];
