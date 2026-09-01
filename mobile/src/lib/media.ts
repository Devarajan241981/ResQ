import * as ImagePicker from "expo-image-picker";

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

/** Prompt for library permission and let the user pick up to `limit` images. */
export async function pickImages(limit = 1): Promise<PickedImage[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return [];
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.7,
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
  });
  if (res.canceled) return [];
  return res.assets.map((a, i) => ({
    uri: a.uri,
    name: a.fileName ?? `photo-${Date.now()}-${i}.jpg`,
    type: a.mimeType ?? "image/jpeg",
  }));
}

/** React Native's FormData accepts a { uri, name, type } object for file parts. */
export function appendFile(form: FormData, field: string, img: PickedImage) {
  form.append(field, { uri: img.uri, name: img.name, type: img.type } as unknown as Blob);
}
