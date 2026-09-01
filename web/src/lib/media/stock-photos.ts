/**
 * Curated Unsplash photos (free license, no attribution required) used for
 * landing-page imagery. Each URL was verified reachable (HTTP 200) before
 * being added here — see the ResQ Bharath build notes for the source search.
 */
function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;
}

export const PHOTOS = {
  hero: unsplash("1696887484490-715e7eb0e682", 2000), // Taj Mahal — grand Indian landmark, no government emblem/flag
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
  campaigns: "/images/campaigns-cleanliness-drive.jpg", // Swachh Bharat-style cleanliness drive
  festival: unsplash("1635192592106-77a5aacbe1a3", 2000), // lit diyas + rangoli — festivals/calendar (viewed: no text/logos)
  reliefTeam: unsplash("1582213782179-e0d53f98f2ca", 1600), // hands stacked in colourful sweaters — teamwork/community (viewed: no text/logos)
} as const;

/**
 * Hero background slideshow — professional/institutional and community-welfare
 * imagery. No monuments, no official government emblems/flags/logos of ANY
 * country (that also ruled out a "street cleaning" photo that turned out to
 * have a Barcelona municipal campaign logo visible on the uniform, and a
 * food-bank photo with a prominent commercial brand front-and-center — every
 * image here was opened and visually inspected, not just read from a text
 * description, before being added). Every slide is unique to the hero — none
 * of these also appear in PHOTOS above. 4K-ish width for a full-bleed
 * background.
 */
export const HERO_SLIDES = [
  unsplash("1676181739859-08330dea8999", 2400), // judge's gavel on marble — judiciary/institutional gravitas
  unsplash("1651372381086-9861c9c81db5", 2400), // diverse group joining hands — community/welfare unity
  unsplash("1469571486292-0ba58a3f068b", 2400), // many hands forming a red heart — unity, care, blood donation
  unsplash("1758691462268-fbe66c4f3e28", 2400), // doctor examining a child's chest with a stethoscope — healthcare
  unsplash("1532938911079-1b06ac7ceec7", 2400), // doctor holding a stethoscope, arms crossed — medical professionalism
] as const;
