export interface CityInfo {
    slug: string;
    name: string;
    county: string;
    stores: number;
}

// Cities with a strong GSC query signal or major Lidl presence.
export const CITIES: CityInfo[] = [
    { slug: 'bucuresti', name: 'București', county: 'București', stores: 38 },
    { slug: 'cluj-napoca', name: 'Cluj-Napoca', county: 'Cluj', stores: 9 },
    { slug: 'timisoara', name: 'Timișoara', county: 'Timiș', stores: 8 },
    { slug: 'iasi', name: 'Iași', county: 'Iași', stores: 7 },
    { slug: 'constanta', name: 'Constanța', county: 'Constanța', stores: 7 },
    { slug: 'brasov', name: 'Brașov', county: 'Brașov', stores: 6 },
    { slug: 'craiova', name: 'Craiova', county: 'Dolj', stores: 5 },
    { slug: 'ploiesti', name: 'Ploiești', county: 'Prahova', stores: 4 },
    { slug: 'oradea', name: 'Oradea', county: 'Bihor', stores: 4 },
    { slug: 'bacau', name: 'Bacău', county: 'Bacău', stores: 4 },
    { slug: 'sibiu', name: 'Sibiu', county: 'Sibiu', stores: 4 },
    { slug: 'baia-mare', name: 'Baia Mare', county: 'Maramureș', stores: 3 },
    { slug: 'suceava', name: 'Suceava', county: 'Suceava', stores: 3 },
    { slug: 'buzau', name: 'Buzău', county: 'Buzău', stores: 3 },
    { slug: 'pitesti', name: 'Pitești', county: 'Argeș', stores: 3 },
    { slug: 'arad', name: 'Arad', county: 'Arad', stores: 3 },
    { slug: 'targu-mures', name: 'Târgu Mureș', county: 'Mureș', stores: 3 },
    { slug: 'galati', name: 'Galați', county: 'Galați', stores: 3 },
    { slug: 'satu-mare', name: 'Satu Mare', county: 'Satu Mare', stores: 2 },
    { slug: 'carei', name: 'Carei', county: 'Satu Mare', stores: 1 },
];

export const CITY_MAP: Record<string, CityInfo> = Object.fromEntries(CITIES.map(city => [city.slug, city]));
