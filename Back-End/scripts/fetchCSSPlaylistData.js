/**
 * Script لجلب بيانات كل فيديوهات playlist الـ CSS من Elzero Web School
 * 
 * Playlist: https://www.youtube.com/playlist?list=PLDoPjvoNmBAzjsz06gkzlSrlev53MGIKe
 * 
 * الاستخدام:
 *   node scripts/fetchCSSPlaylistData.js
 * 
 * بيطلع JSON فيه كل بيانات الفيديوهات (العنوان، الـ ID، المدة، الترتيب)
 */

const PLAYLIST_ID = 'PLDoPjvoNmBAzjsz06gkzlSrlev53MGIKe';
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

/**
 * جلب صفحة الـ Playlist من يوتيوب واستخراج ytInitialData
 */
async function fetchPlaylistPage(url) {
  console.log(`🔍 جاري جلب صفحة الـ Playlist...`);
  console.log(`   URL: ${url}\n`);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });

  if (!response.ok) {
    throw new Error(`فشل في جلب الصفحة: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // استخراج ytInitialData من الصفحة
  const match = html.match(/var\s+ytInitialData\s*=\s*({.*?});<\/script>/s);
  if (!match) {
    throw new Error('لم يتم العثور على ytInitialData في الصفحة');
  }

  return JSON.parse(match[1]);
}

/**
 * استخراج بيانات الفيديوهات من ytInitialData
 */
function extractVideos(data) {
  const videos = [];

  try {
    // المسار للوصول لقائمة الفيديوهات في YouTube's response
    const contents = data
      ?.contents
      ?.twoColumnBrowseResultsRenderer
      ?.tabs?.[0]
      ?.tabRenderer
      ?.content
      ?.sectionListRenderer
      ?.contents?.[0]
      ?.itemSectionRenderer
      ?.contents?.[0]
      ?.playlistVideoListRenderer
      ?.contents;

    if (!contents) {
      throw new Error('لم يتم العثور على قائمة الفيديوهات');
    }

    for (const item of contents) {
      const video = item.playlistVideoRenderer;
      if (!video) continue; // skip continuationItemRenderer

      const videoId = video.videoId;
      const title = video.title?.runs?.[0]?.text || 'Unknown Title';

      // المدة بالثواني
      let duration = 0;
      const lengthText = video.lengthText?.simpleText; // مثل "8:22"
      if (lengthText) {
        const parts = lengthText.split(':').map(Number);
        if (parts.length === 3) {
          duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          duration = parts[0] * 60 + parts[1];
        }
      }

      const index = parseInt(video.index?.simpleText || videos.length + 1);

      videos.push({
        order: index,
        title,
        videoId,
        duration,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });
    }
  } catch (error) {
    console.error('❌ خطأ في استخراج الفيديوهات:', error.message);
  }

  return videos;
}

/**
 * جلب بقية الفيديوهات عبر YouTube's continuation API
 */
async function fetchContinuation(token, apiKey) {
  const response = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240101.00.00',
          hl: 'en',
          gl: 'US',
        }
      },
      continuation: token,
    })
  });

  if (!response.ok) {
    throw new Error(`فشل في جلب المزيد من الفيديوهات: ${response.status}`);
  }

  return response.json();
}

/**
 * استخراج الـ continuation token و الـ API key من الصفحة
 */
function extractContinuationInfo(data, html) {
  let continuationToken = null;
  let apiKey = null;

  // استخراج الـ continuation token
  const contents = data
    ?.contents
    ?.twoColumnBrowseResultsRenderer
    ?.tabs?.[0]
    ?.tabRenderer
    ?.content
    ?.sectionListRenderer
    ?.contents?.[0]
    ?.itemSectionRenderer
    ?.contents?.[0]
    ?.playlistVideoListRenderer
    ?.contents;

  if (contents) {
    const lastItem = contents[contents.length - 1];
    continuationToken = lastItem?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
  }

  // استخراج الـ API key
  if (html) {
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    apiKey = apiKeyMatch?.[1] || 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8'; // fallback
  }

  return { continuationToken, apiKey };
}

/**
 * استخراج فيديوهات من continuation response
 */
function extractContinuationVideos(data, startIndex) {
  const videos = [];

  const actions = data?.onResponseReceivedActions;
  if (!actions) return videos;

  for (const action of actions) {
    const items = action?.appendContinuationItemsAction?.continuationItems;
    if (!items) continue;

    for (const item of items) {
      const video = item.playlistVideoRenderer;
      if (!video) continue;

      const videoId = video.videoId;
      const title = video.title?.runs?.[0]?.text || 'Unknown Title';

      let duration = 0;
      const lengthText = video.lengthText?.simpleText;
      if (lengthText) {
        const parts = lengthText.split(':').map(Number);
        if (parts.length === 3) {
          duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          duration = parts[0] * 60 + parts[1];
        }
      }

      const index = parseInt(video.index?.simpleText || startIndex + videos.length + 1);

      videos.push({
        order: index,
        title,
        videoId,
        duration,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      });
    }
  }

  return videos;
}

/**
 * الدالة الرئيسية - جلب كل الفيديوهات
 */
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 جلب بيانات Playlist: Learn CSS In Arabic 2021');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. جلب الصفحة الأولى
    const response = await fetch(PLAYLIST_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });

    const html = await response.text();

    // استخراج ytInitialData
    const match = html.match(/var\s+ytInitialData\s*=\s*({.*?});<\/script>/s);
    if (!match) {
      throw new Error('لم يتم العثور على ytInitialData');
    }

    const initialData = JSON.parse(match[1]);

    // 2. استخراج الفيديوهات الأولى
    let allVideos = extractVideos(initialData);
    console.log(`✅ تم جلب ${allVideos.length} فيديو من الصفحة الأولى`);

    // 3. جلب بقية الفيديوهات عبر continuation
    let { continuationToken, apiKey } = extractContinuationInfo(initialData, html);

    while (continuationToken) {
      console.log(`🔄 جاري جلب المزيد من الفيديوهات...`);
      const contData = await fetchContinuation(continuationToken, apiKey);
      const moreVideos = extractContinuationVideos(contData, allVideos.length);

      if (moreVideos.length === 0) break;

      allVideos = [...allVideos, ...moreVideos];
      console.log(`   ✅ إجمالي الفيديوهات: ${allVideos.length}`);

      // التحقق من وجود continuation آخر
      const actions = contData?.onResponseReceivedActions;
      continuationToken = null;
      if (actions) {
        for (const action of actions) {
          const items = action?.appendContinuationItemsAction?.continuationItems;
          if (items) {
            const lastItem = items[items.length - 1];
            continuationToken = lastItem?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
          }
        }
      }
    }

    // 4. طباعة النتائج
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📊 إجمالي الفيديوهات: ${allVideos.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // عرض كل الفيديوهات
    console.log('📋 قائمة الفيديوهات:');
    console.log('─'.repeat(80));

    for (const video of allVideos) {
      const mins = Math.floor(video.duration / 60);
      const secs = video.duration % 60;
      console.log(`  ${String(video.order).padStart(2, '0')}. [${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}] ${video.title}`);
      console.log(`      ID: ${video.videoId}`);
    }

    // 5. طباعة الـ JSON للاستخدام في سكريبت الإضافة
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 JSON Data للاستخدام في سكريبت الإضافة:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // تنسيق البيانات بنفس format الـ import script
    const formattedVideos = allVideos.map((v, i) => ({
      order: v.order,
      title: v.title,
      videoId: v.videoId,
      duration: v.duration,
      isFreePreview: i < 2, // أول فيديوهين بس preview
    }));

    console.log('const videos = ' + JSON.stringify(formattedVideos, null, 2) + ';');

    // 6. إجمالي المدة
    const totalDuration = allVideos.reduce((sum, v) => sum + v.duration, 0);
    const totalHours = Math.floor(totalDuration / 3600);
    const totalMins = Math.floor((totalDuration % 3600) / 60);
    console.log(`\n⏱️  إجمالي مدة الكورس: ${totalHours} ساعة و ${totalMins} دقيقة`);

    return allVideos;
  } catch (error) {
    console.error('❌ خطأ:', error.message);

    // Fallback: استخدام RSS feed (بيرجع أول 15 فيديو بس)
    console.log('\n🔄 جاري المحاولة عبر RSS Feed...');
    await fetchViaRSS();
  }
}

/**
 * Fallback: جلب بيانات الفيديوهات عبر RSS Feed
 * (ملاحظة: الـ RSS بيرجع أول 15 فيديو فقط)
 */
async function fetchViaRSS() {
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;

  try {
    const response = await fetch(RSS_URL);
    const xml = await response.text();

    // استخراج الفيديوهات من XML
    const videoRegex = /<yt:videoId>([^<]+)<\/yt:videoId>\s*[\s\S]*?<title>([^<]+)<\/title>/g;
    const videos = [];
    let match;
    let order = 1;

    while ((match = videoRegex.exec(xml)) !== null) {
      videos.push({
        order: order++,
        title: match[2],
        videoId: match[1],
        duration: 0, // RSS لا يوفر المدة
      });
    }

    console.log(`\n📊 تم جلب ${videos.length} فيديو من RSS Feed`);
    console.log('⚠️  ملاحظة: RSS Feed يرجع أول 15 فيديو فقط والمدة غير متوفرة');

    for (const video of videos) {
      console.log(`  ${String(video.order).padStart(2, '0')}. ${video.title} (${video.videoId})`);
    }

    return videos;
  } catch (error) {
    console.error('❌ فشل RSS أيضاً:', error.message);
  }
}

main();
