/** Generates two static pages from the single editable content source. Node 18+. */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(readFileSync(resolve(root, 'src/content.json'), 'utf8'));
const { profile, education, projects } = data;
const release = process.argv.includes('--release');
const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iconPaths = {
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>', back:'<path d="M19 12H5m6-6-6 6 6 6"/>', external:'<path d="M13 5h6v6m0-6-9 9M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>', chevron:'<path d="m6 9 6 6 6-6"/>', up:'<path d="M12 19V5m-6 6 6-6 6 6"/>', sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', moon:'<path d="M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>', file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8m-8 4h8"/>', image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>', download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3"/>', copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>', mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>', phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2A18 18 0 0 1 4 6.2 2 2 0 0 1 6 4h3l2 5-2.4 1.6a15 15 0 0 0 4.8 4.8L15 13l5 2a2 2 0 0 1 2 1.9Z"/>', briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-9 0v3"/>', home:'<path d="m3 10 9-7 9 7v10H3Zm6 10v-6h6v6"/>', court:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16M3 10h18M3 14h18"/>', check:'<path d="m5 12 4 4L19 6"/>'
};
const ic = (name, cls='') => `<svg class="icon ${e(cls)}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconPaths[name] || ''}</svg>`;
const mark = () => `<span class="monogram" aria-hidden="true"><svg viewBox="0 0 76 56" fill="none" width="76" height="56"><path d="M6 49V7l18 24L42 7v42M42 7l14 23L70 7M56 30v19" stroke="currentColor" stroke-width="4.5" stroke-linecap="square" stroke-linejoin="miter"/><path d="M6 55h64" stroke="currentColor" stroke-width="1" opacity=".35"/></svg></span>`;
const divider = () => '<div class="section-divider" aria-hidden="true"></div>';
const tags = items => `<ul class="tags" aria-label="Skills and tools">${items.map(x=>`<li>${e(x)}</li>`).join('')}</ul>`;
const list = items => `<ul class="contributions">${items.map(x=>`<li>${e(x)}</li>`).join('')}</ul>`;
const external = u => /^https?:\/\//i.test(u || '');
function asset(u, base='') {
  if (!u) return null;
  if (external(u)) return u;
  if (!u.startsWith('assets/') || u.includes('..') || !existsSync(resolve(root,u))) throw Error(`Missing or unsafe asset: ${u}`);
  return base + u;
}
function outLink(url, label, cls='', base='', labelExtra='') {
  if (!url) return '';
  const href=asset(url,base);
  return `<a class="${e(cls)}" href="${e(href)}" target="_blank" rel="noopener noreferrer" aria-label="${e(labelExtra || label)} (opens in a new tab)">${e(label)} ${ic('external')}</a>`;
}
function cvAction(base='') {
  return profile.cv ? `<a class="button secondary" href="${e(asset(profile.cv,base))}" ${external(profile.cv)?'target="_blank" rel="noopener noreferrer"':'download'}>${ic('download')} Download CV</a>` : '';
}
const links = [['Contact','contact'],['About','about'],['Background','background'],['Project','projects'],['Skills','skills']];
function header(casePage=false) {
  const menu=casePage ? `<a href="../../">${ic('home')} Home</a><a href="../../#projects">Back to Projects</a>` : links.map(([label,id])=>`<a href="#${id}">${e(label)}</a>`).join('');
  return `<header class="site-header${casePage?' case-header':''}"><div class="header-inner"><nav id="primary-nav" class="primary-nav" aria-label="Primary navigation">${menu}</nav><button type="button" class="menu-toggle icon-button" aria-expanded="false" aria-controls="primary-nav" hidden>${ic('menu','menu-open')}${ic('close','menu-close')}<span>Menu</span></button><button type="button" class="theme-toggle icon-button" aria-label="Switch to dark mode" title="Switch to dark mode" hidden>${ic('sun','light-icon')}${ic('moon','dark-icon')}</button></div></header>`;
}
function section(id,title,body,opts={}) {
 return `${opts.noDivider?'':divider()}<section class="section ${opts.cls||''}" id="${id}" aria-labelledby="heading-${id}"><div class="section-heading">${opts.number?`<span class="section-index">${opts.number}</span>`:''}<${opts.subheading?'h3':'h2'} id="heading-${id}">${e(title)}</${opts.subheading?'h3':'h2'}>${opts.note?`<span class="heading-note">${e(opts.note)}</span>`:''}</div><div class="section-body">${body}</div></section>`;
}
function preview(p,base='') {
  if(p.cover) return `<figure class="project-preview has-image"><img src="${e(asset(p.cover,base))}" alt="${e(p.coverAlt || `${p.name} project preview`)}" ${p.coverSize?`width="${Number(p.coverSize[0])}" height="${Number(p.coverSize[1])}"`:""} loading="lazy" decoding="async"><figcaption class="meta">UI mockup</figcaption></figure>`;
  if(release) return '';
  return `<div class="project-preview preview-pending" role="group" aria-label="Project screenshot pending"><div class="preview-placeholder-inner">${ic('image')}<span class="preview-title">${e(p.name)}</span><span class="meta">Project screenshot pending</span><span class="preview-subtitle">${e(p.platform)} · ${e(p.type)}</span></div></div>`;
}
function artifactRows(items,base='',library=false) {
  return `<ul class="artifact-list${library?' library-list':''}">${items.map(a=>`<li><div class="artifact-info">${ic('file')}<div><span class="artifact-name">${e(a.title)}</span>${library?`<span class="artifact-category">${e(a.category)}</span>`:''}</div></div><div class="artifact-end">${a.count?`<span class="artifact-count">${e(a.count)}</span>`:''}${a.url?outLink(a.url,'View','artifact-link',base,`View ${a.title}`):library&&!release?'<span class="pending-note">File pending</span>':''}</div></li>`).join('')}</ul>`;
}
function toolGroups(p) { return `<div class="tool-groups">${p.tools.map(g=>`<div>${g.group?`<div class="tool-label">${e(g.group)}</div>`:''}${tags(g.items)}</div>`).join('')}</div>`; }
function project(p) {
  const title = e(p.displayName || p.name);
  const dateParts = p.date.split(" ");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dateLabel = `${String(months.indexOf(dateParts[0])+1).padStart(2,"0")}/${dateParts[1]}`;
  const externalHeader = p.url?`<a class="project-external icon-button" href="${e(p.url)}" target="_blank" rel="noopener noreferrer" title="Open project website" aria-label="Open ${title} (opens in a new tab)">${ic('external')}</a>`:'';
  return `<article class="project${p.featured?' featured':''}" id="${p.id}"><details ${p.featured?'open':''}><summary><span class="project-symbol">${ic(p.id==='hitalent'?'briefcase':p.id==='san-vui'?'court':'home')}</span><div class="project-header-text"><h3><span>${title}</span><span class="project-title-meta">– ${e(p.type.replace("Project","project"))} ${e(dateLabel)}</span>${p.featured?'<span class="featured-label">Featured</span>':''}</h3><div class="project-meta"><div><strong>Role:</strong> ${e(p.role)}</div><div><strong>Platform:</strong> ${e(p.platform)}</div></div></div>${ic('chevron','disclosure-chevron')}</summary><div class="project-body">${preview(p)}<div class="project-intro"><h4>Overview</h4><p>${e(p.overview)}</p></div><div class="actions project-actions">${outLink(p.url,'View',p.featured?'button primary':'button secondary','',`View ${p.name}`)}</div><div class="project-subsection"><h4>Key Contributions</h4>${list(p.contributions)}</div><div class="project-subsection"><h4>Tools</h4>${toolGroups(p)}</div></div></details>${externalHeader}</article>`;
}
function footer(base='') {
 return `<footer class="footer" id="footer"><span>${e(profile.name)} <span class="footer-dot">·</span> ${e(profile.role)}</span><a href="#top" class="back-top">Back to Top ${ic('up')}</a></footer>`;
}
function layout({title,description,base='',body,casePage=false}) {
 return `<!doctype html>\n<html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${e(description)}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:type" content="website"><meta name="theme-color" content="#F5F4F8"><title>${e(title)}</title><link rel="icon" type="image/svg+xml" href="${base}assets/favicon.svg"><script src="${base}assets/theme-init.js"></script><link rel="stylesheet" href="${base}assets/styles.css"><script src="${base}assets/site.js" defer></script></head><body><a href="#main-content" class="skip-link">Skip to content</a><div class="page-frame" id="top">${header(casePage)}<main id="main-content" tabindex="-1">${body}</main>${footer(base)}</div></body></html>\n`;
}
const portrait = profile.portrait?`<img class="portrait" src="${e(asset(profile.portrait))}" alt="Portrait of ${e(profile.name)}" width="144" height="176">`:`<div class="portrait portrait-pending" aria-label="${release?'Personal initials':'Profile portrait pending'}" role="img"><span>MY</span>${release?'':'<small>Portrait pending</small>'}</div>`;
const profileSection = `<div id="identity" class="identity-banner">${mark()}</div><section class="profile profile-revised" id="contact" aria-labelledby="profile-name"><div class="profile-copy"><div class="profile-intro"><p class="eyebrow">${e(profile.role)}</p><h1 id="profile-name">${e(profile.name)}</h1><p class="positioning">${e(profile.positioning)}</p></div><address class="profile-contact" aria-label="Contact information">${profile.phone?`<div class="contact-line"><a href="tel:${e(profile.phone.replace(/[^+\d]/g,''))}">${ic('phone')}<span>${e(profile.phone)}</span></a></div>`:''}<div class="email-row"><a class="email-link" href="mailto:${e(profile.email)}">${ic('mail')}<span>${e(profile.email)}</span></a><button class="icon-button copy-button" type="button" data-copy="${e(profile.email)}" hidden aria-label="Copy email address" title="Copy email address">${ic('copy')}<span>Copy</span></button></div><p class="copy-status" role="status" aria-live="polite"></p><div class="location">${ic('pin')} ${e(profile.location)}</div></address>${profile.cv?`<div class="actions">${cvAction()}</div>`:''}</div>${portrait}</section>`;
const about = section('about','About Me',`${data.about.map(p=>`<p>${e(p)}</p>`).join('')}<blockquote class="philosophy"><span class="quote-mark" aria-hidden="true">“</span><p>${e(data.philosophy)}</p></blockquote>`);
const projectSection = `${divider()}<section id="projects" class="section projects-section" aria-labelledby="heading-projects"><div class="section-heading"><h2 id="heading-projects">Project</h2></div>${projects.map(project).join('')}</section>`;
// The source categories are retained in content.json; display them under the four requested labels.
const skillGroups = {
  'BA Knowledge': data.skills['Business Analysis'],
  'Tools': data.skills['Tools & Technical Skills'].filter(x=>x!=='SQL'),
  'Analytical Skills': data.skills['Soft Skills'],
  'Technical Foundation': [...data.skills['Tools & Technical Skills'].filter(x=>x==='SQL'),...data.skills['Methodologies & Frameworks']]
};
const skills=section('skills','Skills',`<div class="skills-grid">${Object.entries(skillGroups).map(([g,items])=>`<div class="skill-group"><h3>${e(g)}</h3>${tags(items)}</div>`).join('')}</div>`);
const edu=section('education','Education',`<div class="entry-top"><div><h3>${e(education.institution)}</h3><p class="entry-subtitle">${e(education.degree)} · ${e(education.major)}</p></div><span class="meta date">${e(education.date)}</span></div><dl class="education-meta"><div><dt>GPA</dt><dd>${e(education.gpa)}</dd></div><div><dt>Major</dt><dd>${e(education.major)}</dd></div></dl><h4>Recognition</h4>${list(education.recognition)}<div class="thesis"><h4>Graduation Thesis</h4><p>${e(education.thesis)}</p></div>`,{noDivider:true,subheading:true,cls:'background-subsection'});
const research=section('research','Research Achievements',`<div class="research-list">${data.research.map(r=>`<article class="research-entry"><div class="entry-top"><h3>${e(r.title)}</h3>${r.date?`<span class="meta date">${e(r.date)}</span>`:''}</div><p>${r.label==='Contribution'?'':`<span class="meta">${e(r.label)} · </span>`}${e(r.description)}</p></article>`).join('')}</div>`,{subheading:true,cls:'background-subsection'});
const certifications=section('certifications','Certifications',Object.entries(data.certifications).map(([g,items])=>`<div class="certificate-group"><h3>${e(g)}</h3><ul class="certificate-list">${items.map(a=>`<li>${ic('file')}${a.url?outLink(a.url,a.title,'certificate-link'):`<span class="certificate-link">${e(a.title)}</span>`}</li>`).join('')}</ul></div>`).join(''),{subheading:true,cls:'background-subsection'});
const languages=section('languages','Languages',`<ul class="language-list">${data.languages.map(x=>`<li>${x.url?outLink(x.url,x.title,'text-link'):e(x.title)}</li>`).join('')}</ul>`,{subheading:true,cls:'background-subsection'});
const background=`${divider()}<section class="background" id="background" aria-labelledby="heading-background"><div class="section-heading"><h2 id="heading-background">Background</h2></div>${edu}${research}${certifications}${languages}</section>`;
const homepage=layout({title:`${profile.name} — Business Analyst Portfolio`,description:`Business Analyst portfolio of ${profile.name}, featuring HiTalent, selected team projects, BA deliverables, skills and research.`,body:profileSection+about+background+projectSection+skills});
const h=projects.find(p=>p.id==='hitalent'); const base='../../';
const caseOverview=`<div class="case-intro"><a class="back-link" href="../../#projects">${ic('back')} Back to Projects</a><p class="eyebrow">Featured project / Case study</p><h1>${e(h.name)}</h1><p class="case-description">Recruitment-focused Business Analysis case study</p><dl class="case-meta">${[['Role',h.role],['Project type',h.type],['Date',h.date],['Platform',h.platform]].map(([k,v])=>`<div><dt>${k}</dt><dd>${e(v)}</dd></div>`).join('')}</dl><div class="actions">${outLink(h.url,'View Project','button primary')}${`<a class="button secondary" href="#deliverables">Deliverable Library ${ic('arrow')}</a>`}</div></div>`;
const caseSections=[{id:'overview',title:'Project Overview'},...data.caseStudy,{id:'deliverables',title:'Deliverable Library'}];
const caseNav=`<nav class="case-contents" aria-label="Case study contents"><p class="eyebrow">On this page</p><ol>${caseSections.map((s,i)=>`<li><a href="#${s.id}"><span>${String(i+1).padStart(2,'0')}</span>${e(s.title)}</a></li>`).join('')}</ol></nav>`;
const narrative=`<div class="approach"><span class="eyebrow">Analysis approach</span><ol>${['Business problem','Stakeholder needs','Process analysis','Requirements','System modeling','Proposed solution'].map(s=>`<li>${e(s)}</li>`).join('')}</ol></div>`;
const overview=section('overview','Project Overview',`<p>${e(h.overview)}</p>${narrative}${preview(h,base)}<h3 class="small-heading">Tools</h3>${toolGroups(h)}`,{number:'01'});
const stages=data.caseStudy.map((s,i)=>section(s.id,s.title,`<p>${e(s.contribution!=null?h.contributions[s.contribution]:s.intro)}</p>${s.artifacts.length?artifactRows(s.artifacts.map(id=>h.artifacts.find(a=>a.id===id)),base):''}${!release&&s.artifacts.length===0?'<p class="asset-note">Supporting research and interview materials pending.</p>':''}`,{number:String(i+2).padStart(2,'0')})).join('');
const library=section('deliverables','Deliverable Library',`<p>Business analysis deliverables documented for HiTalent. Counts describe artifacts and scope, not business outcomes.</p>${artifactRows(h.artifacts,base,true)}${!release?'<p class="asset-note">Individual artifact files are pending. The project link below opens the existing HiTalent website.</p>':''}<div class="actions">${outLink(h.url,'View Project','button primary',base)}<a class="button secondary" href="../../#projects">${ic('back')} Back to Projects</a></div>`,{number:'08'});
const casePage=layout({title:`HiTalent Case Study — ${profile.name}`,description:'HiTalent recruitment-focused Business Analysis case study: market research, elicitation, process analysis, requirements, system modeling and deliverables.',base,casePage:true,body:caseOverview+caseNav+overview+stages+library});
for (const [file,html] of [['index.html',homepage],['projects/hitalent/index.html',casePage]]) { const path=resolve(root,file); mkdirSync(dirname(path),{recursive:true}); writeFileSync(path,html); }
console.log(`Built two static pages (${release?'release':'development'} mode).`);
