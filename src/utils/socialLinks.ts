export const socialNetworks = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
] as const;

export type SocialLinks = Record<typeof socialNetworks[number]['key'], string>;

export const emptySocialLinks: SocialLinks = { instagram: '', facebook: '' };

export function isSocialLink(value: string): boolean {
  if (!/^https:\/\//i.test(value) || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function readSocialLinks(value?: string): SocialLinks {
  if (value === undefined) {
    return { instagram: 'https://www.instagram.com/zapateriaangelita/', facebook: '' };
  }

  try {
    const data = JSON.parse(value);
    const links = { ...emptySocialLinks };
    for (const { key } of socialNetworks) {
      if (typeof data?.[key] === 'string' && isSocialLink(data[key])) links[key] = data[key];
    }
    return links;
  } catch {
    return emptySocialLinks;
  }
}
