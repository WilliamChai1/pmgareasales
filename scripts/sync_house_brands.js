/**
 * PMG House Brands Ongoing Sync Engine
 * Extracts all official PMG House Brand products directly from Jase Healthcare
 * (https://jasehealthcare.com/products/ via WordPress REST API)
 */
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://jasehealthcare.com/wp-json/wp/v2';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'house_brands_catalog.json');

async function syncHouseBrands() {
  console.log('🔄 Connecting to Jase Healthcare API...');
  
  let allProducts = [];
  const perPage = 100;
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${API_BASE}/product?per_page=${perPage}&page=${page}&_fields=id,title,slug,link,excerpt,content`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PMG-Sales-Hub/1.0' }
      });
      if (!res.ok) {
        console.error(`❌ Page ${page} failed with status ${res.status}`);
        break;
      }
      totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
      const totalCount = res.headers.get('x-wp-total') || 'unknown';
      const items = await res.json();
      allProducts.push(...items);
      console.log(`  ✓ Fetched page ${page} of ${totalPages} (${items.length} products, total fetched: ${allProducts.length} / ${totalCount})`);
      page++;
    } catch (err) {
      console.error(`❌ Fetch error on page ${page}:`, err.message);
      break;
    }
  }

  if (allProducts.length === 0) {
    console.error('⚠️ No products retrieved.');
    return;
  }

  // Clean and categorize products
  const formattedCatalog = allProducts.map(p => {
    const cleanTitle = p.title.rendered
      .replace(/&#8211;/g, '–')
      .replace(/&#038;/g, '&')
      .replace(/&amp;/g, '&')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();

    // Determine Brand
    let brand = 'Other PMG Brand';
    if (cleanTitle.startsWith('Nutribridge')) brand = 'Nutribridge';
    else if (cleanTitle.startsWith('JH Nutrition')) brand = 'JH Nutrition';
    else if (cleanTitle.startsWith('Livemore')) brand = 'Livemore';
    else if (cleanTitle.includes('Dermsolve') || cleanTitle.startsWith('VK')) brand = 'VK Dermsolve';
    else if (cleanTitle.startsWith('V∞') || cleanTitle.startsWith('V-Infinity') || cleanTitle.includes('Vtrox') || cleanTitle.includes('Neoflex')) brand = 'V-Infinity';
    else if (cleanTitle.startsWith('Denticlear')) brand = 'Denticlear';
    else if (cleanTitle.startsWith('Chewy-C')) brand = 'Chewy-C';
    else if (cleanTitle.startsWith('Medicplast')) brand = 'Medicplast';
    else if (cleanTitle.startsWith('Joycerin')) brand = 'Joycerin';
    else if (cleanTitle.startsWith('Biowell')) brand = 'Biowell';
    else if (cleanTitle.startsWith('Axon')) brand = 'Axon';
    else if (cleanTitle.startsWith('Remeco') || cleanTitle.includes('Pepticon')) brand = 'Remeco';
    else if (cleanTitle.startsWith('Fastlief')) brand = 'Fastlief';
    else if (cleanTitle.includes('–')) brand = cleanTitle.split('–')[0].trim();

    const cleanExcerpt = p.excerpt && p.excerpt.rendered
      ? p.excerpt.rendered.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      : '';

    const cleanContent = p.content && p.content.rendered
      ? p.content.rendered.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      : '';

    return {
      id: p.id,
      brand: brand,
      title: cleanTitle,
      slug: p.slug,
      link: p.link,
      summary: cleanExcerpt || cleanContent.substring(0, 200),
      indication: extractIndication(cleanContent, cleanExcerpt)
    };
  });

  // Ensure data directory exists
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Save JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(formattedCatalog, null, 2), 'utf8');

  // 2. Save standalone JS bundle for direct browser inclusion
  const jsBundlePath = path.join(outDir, 'house_brands.js');
  const jsContent = `// Auto-generated PMG House Brand Catalog from Jase Healthcare (${new Date().toISOString()})
window.PMG_HOUSE_BRANDS_CATALOG = ${JSON.stringify(formattedCatalog, null, 2)};
`;
  fs.writeFileSync(jsBundlePath, jsContent, 'utf8');

  console.log(`\n🎉 Successfully synced ${formattedCatalog.length} House Brand products to:`);
  console.log(`   - ${OUTPUT_FILE}`);
  console.log(`   - ${jsBundlePath}`);

  // Brand summary breakdown
  const summaryByBrand = {};
  formattedCatalog.forEach(item => {
    summaryByBrand[item.brand] = (summaryByBrand[item.brand] || 0) + 1;
  });
  console.log('\n📊 Brand Breakdown:');
  console.table(summaryByBrand);
}

function extractIndication(content, excerpt) {
  const text = (excerpt + ' ' + content).toLowerCase();
  const tags = [];
  if (text.includes('joint') || text.includes('cartilage') || text.includes('osteoarthritis') || text.includes('bone')) tags.push('Joint & Bone');
  if (text.includes('cholesterol') || text.includes('heart') || text.includes('cardio') || text.includes('omega') || text.includes('blood pressure')) tags.push('Cardiovascular');
  if (text.includes('nerve') || text.includes('tingling') || text.includes('numbness') || text.includes('b12') || text.includes('neuropathy')) tags.push('Nerve Health');
  if (text.includes('digest') || text.includes('probiotic') || text.includes('gut') || text.includes('gastric') || text.includes('reflux') || text.includes('gerd')) tags.push('Digestive & Gut');
  if (text.includes('skin') || text.includes('eczema') || text.includes('collagen') || text.includes('moistur') || text.includes('derma')) tags.push('Dermatology & Beauty');
  if (text.includes('cough') || text.includes('cold') || text.includes('throat') || text.includes('immune') || text.includes('elderberry') || text.includes('flu')) tags.push('Immunity & Respiratory');
  if (text.includes('child') || text.includes('kid') || text.includes('baby') || text.includes('gummy')) tags.push('Pediatric');
  if (text.includes('dental') || text.includes('tooth') || text.includes('mouthwash') || text.includes('floss')) tags.push('Oral Care');
  if (text.includes('plaster') || text.includes('patch') || text.includes('pain') || text.includes('ache') || text.includes('muscle')) tags.push('Pain Relief & Plaster');
  if (text.includes('milk') || text.includes('nutrition') || text.includes('colostrum') || text.includes('protein')) tags.push('Nutrition & Specialty Milk');

  return tags.length > 0 ? tags : ['General Wellness'];
}

if (require.main === module) {
  syncHouseBrands();
}

module.exports = { syncHouseBrands };
