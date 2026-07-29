interface Props {
  name: string;
  size?: number;
}

const JIRA_AVATAR_PALETTE = ['c97cf4', '4bce97', 'fca700', '6cc3e0', 'e774bb', 'ddb30e'];

export default function ProjectBadge({ name, size = 24 }: Props) {
  const src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=${JIRA_AVATAR_PALETTE.join(',')}&radius=20&fontSize=42`;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded"
      style={{ width: size, height: size }}
    />
  );
}