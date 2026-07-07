/**
 * Curated Unsplash photos (free license, no attribution required) used for
 * landing-page imagery. Each URL was verified reachable (HTTP 200) before
 * being added here — see the ResQ India build notes for the source search.
 */
function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;
}

export const PHOTOS = {
  hero: unsplash("1761926927098-ae4631a5a5a2", 2000), // fire truck at a damaged building
  missingPersons: unsplash("1617494532490-297fc0eb515e", 1200), // person walking a city street
  missingChildren: unsplash("1611417041461-2060f649193d", 1200), // child holding parent's hand
  missingElderly: unsplash("1719037108848-685e9e599827", 1200), // elderly person walking
  lostPets: unsplash("1636772611113-d44a76913388", 1200), // dog on a sidewalk
  sos: unsplash("1554734867-bf3c00a49371", 1200), // ambulance responding
  bloodDonation: unsplash("1524721696987-b9527df9e512", 1200), // blood donation
  disasterMode: unsplash("1728320764872-2eebb4f95e4e", 1200), // flooded tents/shelter
  hospitals: unsplash("1565018054866-968e244671af", 1200), // hospital building
  ambulance: unsplash("1612574935301-af13ccce9258", 1200), // ambulance vehicle
  volunteers: unsplash("1560220604-1985ebfe28b1", 1600), // volunteers in matching shirts
  ngos: unsplash("1555069855-e580a9adbf43", 1200), // community meeting
  shelters: unsplash("1742067131963-c466fc838f3c", 1200), // tents in a row
} as const;
