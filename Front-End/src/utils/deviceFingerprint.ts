/**
 * Device Fingerprint Generator
 * بيولد بصمة فريدة للجهاز بناءً على بيانات المتصفح
 * البصمة دي بتتبعت مع كل Request في الـ Header: X-Device-Fingerprint
 */

async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // 1. دقة الشاشة + عمق الألوان
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 2. المنطقة الزمنية
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 3. اللغة
  components.push(navigator.language);

  // 4. عدد الـ CPU cores
  components.push(String(navigator.hardwareConcurrency || 'unknown'));

  // 5. Platform
  components.push(navigator.platform);

  // 6. Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('elearn-fp', 2, 15);
      components.push(canvas.toDataURL());
    }
  } catch {
    components.push('canvas-unavailable');
  }

  // 7. WebGL renderer
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch {
    components.push('webgl-unavailable');
  }

  // هاش كل البيانات
  const raw = components.join('|||');
  const msgBuffer = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * بيحفظ البصمة في localStorage ويرجعها
 * لو مش موجودة بيولد واحدة جديدة
 */
export async function getDeviceFingerprint(): Promise<string> {
  const STORAGE_KEY = 'device_fp';

  let fingerprint = localStorage.getItem(STORAGE_KEY);

  if (!fingerprint) {
    fingerprint = await generateFingerprint();
    localStorage.setItem(STORAGE_KEY, fingerprint);
  }

  return fingerprint;
}

/**
 * تجديد البصمة (مثلاً لو الطالب عمل clear للـ localStorage)
 */
export async function refreshDeviceFingerprint(): Promise<string> {
  localStorage.removeItem('device_fp');
  return getDeviceFingerprint();
}
