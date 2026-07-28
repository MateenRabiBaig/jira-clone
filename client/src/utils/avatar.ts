const AVATAR_COLORS = ['#8F7EE7', '#4BCE97', '#E56910', '#2898BD', '#E774BB', '#F5CD47']

export function getAvatarColor(name: string): string {
    const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export 