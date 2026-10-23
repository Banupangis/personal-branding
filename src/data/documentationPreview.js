export function getDocumentationPreview(url) {
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { type: 'link', url };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { type: 'link', url };
  }

  if (/\.(avif|gif|jpe?g|png|webp|svg)$/i.test(parsedUrl.pathname)) {
    return { type: 'image', url: parsedUrl.href };
  }

  const host = parsedUrl.hostname.toLowerCase();
  let videoId = '';
  if (host === 'youtu.be') {
    videoId = parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
  } else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    if (parsedUrl.pathname === '/watch') {
      videoId = parsedUrl.searchParams.get('v') || '';
    } else {
      videoId = parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || '';
    }
  }
  if (videoId && /^[\w-]+$/.test(videoId)) {
    return { type: 'embed', url: `https://www.youtube-nocookie.com/embed/${videoId}` };
  }

  if (host === 'drive.google.com' || host === 'docs.google.com') {
    const fileId = parsedUrl.pathname.match(/\/d\/([^/]+)/)?.[1]
      || parsedUrl.searchParams.get('id');
    if (fileId) {
      if (host === 'drive.google.com') {
        return {
          type: 'image',
          urls: [
            `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1200`,
            `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`
          ]
        };
      }
      if (host === 'docs.google.com') {
        return { type: 'embed', url: `https://docs.google.com${parsedUrl.pathname.replace(/\/(?:edit|view|pubhtml)\/?$/, '/preview')}` };
      }
    }
  }

  return { type: 'embed', url: parsedUrl.href };
}
