/**
 * PMG House Brands Ongoing Sync Engine
 * Extracts all official PMG House Brand products directly from Jase Healthcare
 * (https://jasehealthcare.com/products/ via WordPress REST API)
 * 
 * Accurately parses:
 * - Active Ingredients & Dosages
 * - True Clinical Indications
 * - Pack Sizes & Dosage Forms
 * - MAL Registration Numbers
 * - Filter Tags without brand keyword contamination
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

  // Clean and accurately categorize products
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

    const rawContent = p.content && p.content.rendered ? p.content.rendered : '';
    const parsed = parseProductDetails(rawContent, cleanExcerpt, cleanTitle);

    return {
      id: p.id,
      brand: brand,
      title: cleanTitle,
      slug: p.slug,
      link: p.link,
      summary: cleanExcerpt || parsed.indication || 'High-quality PMG House Brand formulation.',
      ingredients: parsed.ingredients,
      clinicalIndication: parsed.indication,
      packSize: parsed.packSize,
      mal: parsed.mal,
      tags: parsed.tags
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

  // Spot-check Systoright
  const systo = formattedCatalog.find(p => p.slug === 'jh-nutrition-systoright');
  if (systo) {
    console.log('\n✅ Verified Systoright Data:');
    console.log('   Title:', systo.title);
    console.log('   Ingredients:', systo.ingredients);
    console.log('   Indication:', systo.clinicalIndication);
    console.log('   Tags:', systo.tags.join(', '));
  }
}

function parseProductDetails(contentHtml, cleanExcerpt, cleanTitle) {
  let text = (contentHtml || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8211;/gi, '–')
    .replace(/&#038;/gi, '&')
    .replace(/&amp;/gi, '&')
    .replace(/&#8217;/gi, "'");

  // Merge adjacent bold tags like <strong>Pack</strong><strong> Size</strong>
  text = text.replace(/<\/(?:strong|b)>\s*<(?:strong|b)>/gi, '');

  const sections = {};
  const regex = /<(?:strong|b|h[1-6])[^>]*>\s*([A-Za-z\s]+?):?\s*<\/(?:strong|b|h[1-6])>([\s\S]*?)(?=(?:<(?:strong|b|h[1-6])[^>]*>|$))/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const key = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    const val = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (val && !sections[key]) {
      sections[key] = val;
    }
  }

  const parsed = {
    ingredients: sections['ingredients'] || sections['active ingredients'] || sections['ingredient'] || '',
    indication: sections['indication'] || sections['indications'] || '',
    packSize: sections['pack size'] || sections['pack'] || sections['packaging'] || '',
    mal: sections['mal registration number'] || sections['mal'] || '',
    targetAudience: sections['target audience'] || ''
  };

  parsed.tags = extractIndication(cleanTitle, text, cleanExcerpt, parsed);
  return parsed;
}

function extractIndication(cleanTitle, content, excerpt, parsed) {
  const combined = (cleanTitle + ' ' + excerpt + ' ' + (parsed.indication || '') + ' ' + (parsed.ingredients || '') + ' ' + (parsed.targetAudience || '')).toLowerCase();
  const tags = [];
  
  // Joint & Bone
  if (combined.includes('joint') || combined.includes('cartilage') || combined.includes('osteoarthritis') || combined.includes('bone') || combined.includes('flex')) {
    tags.push('Joint & Bone');
  }

  // Cholesterol & Lipid (Lipi-K, Lipicholin, BG-Pro)
  if (combined.includes('cholesterol') || combined.includes('lipid') || combined.includes('red yeast') || combined.includes('triglyceride')) {
    tags.push('Cholesterol & Lipid');
  }

  // Blood Circulation & Blood Pressure (Systoright, Ginoba, etc.)
  if (combined.includes('circulation') || combined.includes('blood pressure') || combined.includes('vascular') || combined.includes('vitis vinifera') || combined.includes('ginkgo') || combined.includes('ginoba')) {
    tags.push('Blood Circulation & BP');
  }

  // Omega-3 & Heart Wellness (Fish oil, EPA/DHA)
  if (combined.includes('fish oil') || combined.includes('omega') || combined.includes('epa') || combined.includes('dha') || combined.includes('coq10')) {
    tags.push('Omega & Heart Support');
  }

  // Nerve Health (Methylcobalamin, B12, tingling, numbness)
  if (combined.includes('nerve') || combined.includes('tingling') || combined.includes('numbness') || combined.includes('methylcobalamin') || combined.includes('b12') || combined.includes('neuropathy')) {
    tags.push('Nerve Health');
  }

  // Digestive & Gut (Probiotics, Gastric, Pepticon)
  if (combined.includes('probiotic') || combined.includes('gut') || combined.includes('gastric') || combined.includes('reflux') || combined.includes('gerd') || combined.includes('enzyme') || combined.includes('pepticon') || combined.includes('inulin')) {
    tags.push('Digestive & Gut');
  }

  // Dermatology & Skin
  if (combined.includes('eczema') || combined.includes('collagen') || combined.includes('placenta') || combined.includes('moistur') || combined.includes('derma') || combined.includes('cleanser') || combined.includes('skin')) {
    tags.push('Dermatology & Skin');
  }

  // Immunity & Respiratory
  if (combined.includes('cough') || combined.includes('cold') || combined.includes('throat') || combined.includes('elderberry') || combined.includes('flu') || combined.includes('propolis') || combined.includes('immune')) {
    tags.push('Immunity & Respiratory');
  }

  // Pediatric & Kids
  if (combined.includes('kid') || combined.includes('child') || combined.includes('gummy') || combined.includes('baby') || cleanTitle.toLowerCase().includes('kids')) {
    tags.push('Pediatric');
  }

  // Oral Care
  if (combined.includes('tooth') || combined.includes('dental') || combined.includes('mouthwash') || combined.includes('floss')) {
    tags.push('Oral Care');
  }

  // Pain Relief & Plaster
  if (combined.includes('plaster') || combined.includes('patch') || combined.includes('pain relief') || combined.includes('muscular pain')) {
    tags.push('Pain Relief & Plaster');
  }

  // Nutrition & Specialty Milk (ONLY if truly milk or meal replacement formula!)
  if (combined.includes('goat milk') || combined.includes('formula milk') || combined.includes('colostrum milk') || combined.includes('alpha gold') || combined.includes('flexsure gold') || combined.includes('kidsgrow') || combined.includes('meal replacement') || (combined.includes('milk') && !combined.includes('milk thistle'))) {
    tags.push('Nutrition & Specialty Milk');
  }

  return tags.length > 0 ? tags : ['General Health'];
}

if (require.main === module) {
  syncHouseBrands();
}

module.exports = { syncHouseBrands };
