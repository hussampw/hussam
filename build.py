#!/usr/bin/env python3
"""Assemble src/* into a single Blogger theme.xml (bilingual EN/AR)."""
import pathlib, sys

HERE = pathlib.Path(__file__).parent
SRC = HERE / 'src'
css = (SRC / 'style.css').read_text(encoding='utf-8')
ui_js = (SRC / 'ui.js').read_text(encoding='utf-8')
scene_js = (SRC / 'scene.js').read_text(encoding='utf-8')
for name, body in (('style.css', css), ('ui.js', ui_js), ('scene.js', scene_js)):
    if ']]>' in body:
        sys.exit(name + ' contains "]]>" which would break CDATA')

LOGO = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKVoLXWpgrmU6oyKM-Ag030BJ2xgeEh7w22WB4xJL3CvaN66b2RQJusyv28C702sMkV6dJdFYIocFz9KjiYWPbmGSiywJtSQTgj3us_yKFwzqgFEdv9qJlZX1ZF5_qgSouaEsWFbg8rzRp/h120/HUSSAM-LOGO.png'
PHOTO = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgT7Oq5o01HLxCv3ZpGAOqx-6Yj40vYtRWfLSrmFT2A41HSOzjpYdEl567zmauGbJaHv4oTSqAjBA2rAxWKXQHNzKbSog2Qw1f8e9Pf7ndr9lvBapBM56rS-Yvy6T6NkxtZKI4dD5eXPqYB/h680/1705414123252.JPG'

AR_URL = "data:blog.url contains &quot;/p/arabic.html&quot;"
COND_EN = "data:view.isHomepage"
COND_AR = "(%s) and !data:view.isError" % AR_URL

T = {
 'en': dict(
  home='/', other='/p/arabic.html', other_lbl='العربية', other_code='ar',
  navlabel='Main navigation', nav=[('about', 'About'), ('projects', 'Projects'), ('experience', 'Experience'), ('writing', 'Journal')],
  theme='Toggle colour theme', menu='Open navigation',
  kicker_hero='PERSONAL WEBSITE / SOFTWARE DEVELOPER',
  h1='Hi, I&#8217;m <span class="name"><data:blog.title/></span>.<br/>I build for <em>web &amp; mobile.</em>',
  lead='Full-stack developer and software designer. I work across web applications, mobile apps and the systems behind them &#8212; turning ideas into practical software.',
  cta1='View my work &#8595;', scroll='Scroll',
  k_about='01 / ABOUT', h_about='A little about me.',
  about1='I develop and design software, with a particular focus on web and mobile applications. I combine programming languages and tools to solve complex problems, simplify workflows and improve existing products.',
  about2='I&#8217;m comfortable working independently or with a team. My work spans application development, database design, performance improvements and Linux systems. I also share technical articles and what I learn along the way.',
  role='Full-stack developer &#183; Web &amp; mobile', status='Independent developer', touch='Get in touch &#8599;',
  dob='Date of birth', web='Website', loc='Locations', locs='Yemen &#183; Egypt &#183; Oman',
  k_proj='02 / SELECTED PROJECTS', h_proj='A few things I&#8217;ve built.', p_proj='Applications from my personal portfolio.',
  kind_prop='Property management', kind_mob='Mobile application',
  keydoro='A property-management application for organising the essential workflows behind managing properties.',
  explore='Explore the application &#8599;',
  mob_desc='A mobile application from my personal work.', ask='Ask me about this project &#8599;',
  k_exp='03 / EXPERIENCE', h_exp='My development journey.',
  tl=[('2013&#8211;2016', 'Web development beginnings', 'Built a website for social-media workflows and began developing my programming skills.'),
      ('2016&#8211;2017', 'PHP &amp; custom websites', 'Deepened my PHP experience and developed custom websites for clients.'),
      ('2017&#8211;present', 'Full-stack development', 'Developing software for remote clients, combining frontend and backend work.')],
  k_exp2='04 / EXPERTISE', h_svc='How I can help.', p_svc='Practical development, maintenance and technical guidance.',
  svc=[('Web &amp; mobile development', 'Web applications and mobile experiences for iOS and Android.'),
       ('Extensions &amp; custom tools', 'Browser extensions, WordPress plugins, bots and tailored software.'),
       ('Systems &amp; databases', 'Linux administration, software installation and database design and optimisation.'),
       ('Performance &amp; consulting', 'Software maintenance, performance improvements, technical advice and programming lessons.')],
  more='More areas from my experience',
  more_list=['Custom software solutions', 'Software maintenance and updates', 'Technical consulting', 'Database query optimisation', 'Bot development', 'WordPress plugin development', 'Linux systems management', 'Software installation', 'Programming lessons', 'Application security'],
  q1='What do I work on?', a1='Web and mobile software, custom integrations, browser extensions, databases and Linux systems.',
  q2='Can I improve an existing application?', a2='Yes. I work on existing software as well as new projects, including performance, maintenance and custom functionality.',
  print='Print profile &#8599;',
  k_contact='LET&#8217;S CONNECT', h_contact='Let&#8217;s talk about your next idea.',
  p_contact='Have a project, a technical question, or just want to say hello? Email me or send a message.',
  mail='Send an email &#8599;', wa='WhatsApp &#8599;',
  foot='Personal website &#183; Software, projects and notes.',
  loader='Loading'),
 'ar': dict(
  home='/p/arabic.html', other='/', other_lbl='EN', other_code='en',
  navlabel='التنقل الرئيسي', nav=[('about', 'عني'), ('projects', 'أعمالي'), ('experience', 'خبراتي'), ('writing', 'تدويناتي')],
  theme='تبديل المظهر', menu='فتح القائمة',
  kicker_hero='موقعي الشخصي / مطوّر برمجيات',
  h1='أهلًا، أنا <span class="name"><data:blog.title/></span>.<br/>أطوّر <em>للويب والجوال.</em>',
  lead='مطوّر Full-stack ومصمم برمجيات. أعمل على تطبيقات الويب والجوال والأنظمة التي تشغّلها، وأحوّل الأفكار إلى برامج عملية.',
  cta1='شاهد أعمالي &#8595;', scroll='مرّر',
  k_about='01 / ABOUT', h_about='نبذة عني.',
  about1='أطوّر وأصمم البرمجيات، مع اهتمام خاص بتطبيقات الويب والجوال. أدمج لغات البرمجة والأدوات لحل المشكلات المعقدة، وتبسيط الإجراءات، وتحسين المنتجات القائمة.',
  about2='أعمل مستقلًا أو ضمن فريق، وتشمل خبرتي تطوير التطبيقات وتصميم قواعد البيانات وتحسين الأداء وإدارة أنظمة لينكس. أشارك أيضًا تدوينات تقنية وما أتعلمه خلال عملي.',
  role='مطوّر Full-stack &#183; الويب والجوال', status='مطوّر مستقل', touch='تواصل معي &#8599;',
  dob='تاريخ الميلاد', web='الموقع', loc='المناطق', locs='اليمن &#183; مصر &#183; سلطنة عمان',
  k_proj='02 / SELECTED PROJECTS', h_proj='بعض ما عملت عليه.', p_proj='تطبيقات من أعمالي الشخصية.',
  kind_prop='إدارة العقارات', kind_mob='تطبيق جوال',
  keydoro='تطبيق لإدارة العقارات وتنظيم الإجراءات الأساسية المتعلقة بإدارتها.',
  explore='استكشف التطبيق &#8599;',
  mob_desc='تطبيق جوال ضمن أعمالي الشخصية.', ask='اسألني عن هذا المشروع &#8599;',
  k_exp='03 / EXPERIENCE', h_exp='رحلتي في التطوير.',
  tl=[('2013&#8211;2016', 'البدايات في تطوير الويب', 'أنشأت موقعًا للتعامل مع إجراءات مواقع التواصل الاجتماعي وبدأت تطوير مهاراتي البرمجية.'),
      ('2016&#8211;2017', 'PHP والمواقع المخصصة', 'تعمّقت في PHP وأنشأت مواقع مخصصة للعملاء.'),
      ('2017&#8211;الآن', 'تطوير Full-stack', 'أعمل على تطوير البرمجيات للعملاء عن بُعد، وأجمع بين تطوير الواجهات والأنظمة الخلفية.')],
  k_exp2='04 / EXPERTISE', h_svc='كيف أستطيع مساعدتك؟', p_svc='تطوير وصيانة واستشارات تقنية عملية.',
  svc=[('تطوير الويب والجوال', 'تطبيقات ويب وتجارب جوال لأنظمة iOS وAndroid.'),
       ('الإضافات والأدوات المخصصة', 'إضافات المتصفح وووردبريس والبوتات والحلول البرمجية المخصصة.'),
       ('الأنظمة وقواعد البيانات', 'إدارة لينكس وتثبيت البرمجيات وتصميم قواعد البيانات وتحسينها.'),
       ('الأداء والاستشارات', 'صيانة البرمجيات وتحسين الأداء والاستشارات ودروس البرمجة.')],
  more='مجالات إضافية من خبرتي',
  more_list=['الحلول البرمجية المخصصة', 'صيانة البرمجيات وتحديثها', 'الاستشارات التقنية', 'تحسين استعلامات قواعد البيانات', 'برمجة البوتات', 'إضافات ووردبريس', 'إدارة أنظمة لينكس', 'تثبيت البرمجيات', 'دروس البرمجة', 'أمن التطبيقات'],
  q1='ما المجالات التي أعمل عليها؟', a1='برمجيات الويب والجوال والتكاملات المخصصة وإضافات المتصفح وقواعد البيانات وأنظمة لينكس.',
  q2='هل أستطيع تحسين تطبيق قائم؟', a2='نعم، أعمل على البرامج القائمة والمشاريع الجديدة، بما يشمل الأداء والصيانة وإضافة وظائف مخصصة.',
  print='طباعة الملف الشخصي &#8599;',
  k_contact='LET&#8217;S CONNECT', h_contact='لنتحدث عن فكرتك القادمة.',
  p_contact='لديك مشروع أو سؤال تقني أو تريد إلقاء التحية؟ تواصل بالبريد أو أرسل رسالة.',
  mail='أرسل بريدًا &#8599;', wa='واتساب &#8599;',
  foot='موقع شخصي &#183; برمجيات وأعمال وتدوينات.',
  loader='جارٍ التحميل'),
}
SKILLS = ['React', 'Flutter', 'PHP', 'Laravel', 'Yii2', 'WordPress', 'Linux', 'Databases', 'SEO']


def header(t):
    nav = ''.join("<a href='%s#%s'>%s</a>" % (t['home'], i, l) for i, l in t['nav'])
    return ("<header class='header'><div class='wrap header-row'><a class='brand' href='%(home)s'><img alt='' height='32' src='%(logo)s' width='32'/>"
            "<span><data:blog.title/></span></a><nav aria-label='%(navlabel)s' class='nav' id='site-nav'>%(nav)s</nav>"
            "<div class='tools'><a class='language' href='%(other)s' hreflang='%(oc)s' lang='%(oc)s'>%(ol)s</a>"
            "<button aria-label='%(theme)s' aria-pressed='false' class='icon-button theme-toggle' type='button'>&#9680;</button>"
            "<button aria-controls='site-nav' aria-expanded='false' aria-label='%(menu)s' class='icon-button menu-toggle' type='button'>&#9776;</button>"
            "</div></div></header>") % dict(t, logo=LOGO, nav=nav, oc=t['other_code'], ol=t['other_lbl'])


def landing(t):
    skills = ''.join("<span class='skill'>%s</span>" % s for s in SKILLS)
    tl = ''.join("<li data-reveal='data-reveal'><time>%s</time><div><h3>%s</h3><p>%s</p></div></li>" % x for x in t['tl'])
    svc = ''.join("<article class='service-card glass' data-reveal='data-reveal'><h3>%s</h3><p>%s</p></article>" % x for x in t['svc'])
    more = ''.join('<li>%s</li>' % x for x in t['more_list'])
    return """
<section class='hero' data-stage='hero' id='top'><div class='wrap'>
<span class='kicker' data-intro='data-intro'>%(kicker_hero)s</span>
<h1 data-split='data-split'>%(h1)s</h1>
<p class='lead' data-intro='data-intro'>%(lead)s</p>
<div class='actions' data-intro='data-intro'><a class='btn' href='#projects'>%(cta1)s</a><a class='text-link' href='mailto:me@hussam.pw'>me@hussam.pw &#8599;</a></div>
<div class='focus-strip' data-intro='data-intro'><span>WEB DEVELOPMENT</span><span>MOBILE APPLICATIONS</span><span>LINUX &amp; DATABASES</span></div>
</div><div aria-hidden='true' class='scroll-cue'><span>%(scroll)s</span><i></i></div></section>

<section class='panel' data-stage='about' id='about'><div class='wrap about-grid'>
<div class='about-copy glass' data-reveal='data-reveal'><span class='kicker'>%(k_about)s</span><h2>%(h_about)s</h2>
<div class='copy'><p>%(about1)s</p><p>%(about2)s</p></div><div aria-label='Skills' class='skills'>%(skills)s</div></div>
<aside aria-label='%(h_about)s' class='profile glass' data-reveal='data-reveal' data-delay='0.15' itemscope='itemscope' itemtype='https://schema.org/Person'>
<div class='portrait-wrap'><img class='portrait' data-clip='data-clip' expr:alt='data:blog.title' height='340' itemprop='image' loading='lazy' src='%(photo)s' width='300'/></div>
<div class='profile-name' itemprop='name'><data:blog.title/></div><p class='profile-role' itemprop='jobTitle'>%(role)s</p><span class='status'>%(status)s</span>
<div class='profile-details'><a href='mailto:me@hussam.pw' itemprop='email'>me@hussam.pw</a><a dir='ltr' href='tel:+96899007996' itemprop='telephone'>+968 9900 7996</a><a dir='ltr' href='tel:+967772585353'>+967 772 585353</a><a href='https://hussam.pw' itemprop='url'>hussam.pw &#8599;</a></div>
<a class='btn' href='#contact'>%(touch)s</a><meta content='1996-12-15' itemprop='birthDate'/>
<div class='personal-details'><div><span>%(dob)s</span><time datetime='1996-12-15'>15 December 1996</time></div><div><span>%(web)s</span><a href='https://hussam.pw'>hussam.pw</a></div><div><span>%(loc)s</span><span>%(locs)s</span></div></div>
</aside></div></section>

<section class='panel' data-stage='projects' id='projects'>
<div class='wrap section-heading' data-reveal='data-reveal'><span class='kicker'>%(k_proj)s</span><h2>%(h_proj)s</h2><p>%(p_proj)s</p></div>
<div class='wrap projects-viewport'><div class='projects'>
<article class='project featured'><div><div class='project-kind'>%(kind_prop)s</div><h3>Keydoro</h3><p>%(keydoro)s</p><a class='text-link' href='https://keydoro.com'>%(explore)s</a></div><div aria-hidden='true' class='project-emblem'>K.</div></article>
<article class='project'><div class='project-kind'>%(kind_mob)s</div><h3>M7L</h3><p>%(mob_desc)s</p><a class='text-link' href='mailto:me@hussam.pw?subject=M7L'>%(ask)s</a></article>
<article class='project'><div class='project-kind'>%(kind_mob)s</div><h3>Pilxi</h3><p>%(mob_desc)s</p><a class='text-link' href='mailto:me@hussam.pw?subject=Pilxi'>%(ask)s</a></article>
</div></div></section>

<section class='panel' data-stage='experience' id='experience'><div class='wrap exp-grid'>
<div class='section-heading' data-reveal='data-reveal'><span class='kicker'>%(k_exp)s</span><h2>%(h_exp)s</h2></div>
<ol class='timeline'>%(tl)s</ol></div></section>

<section class='panel' data-stage='services' id='services'><div class='wrap'>
<div class='section-heading' data-reveal='data-reveal'><span class='kicker'>%(k_exp2)s</span><h2>%(h_svc)s</h2><p>%(p_svc)s</p></div>
<div class='service-grid'>%(svc)s</div>
<details class='more-services'><summary>%(more)s</summary><ul>%(more_list)s</ul></details>
<details class='more-services'><summary>%(q1)s</summary><p>%(a1)s</p></details>
<details class='more-services'><summary>%(q2)s</summary><p>%(a2)s</p></details>
<button class='print-profile' type='button'>%(print)s</button></div></section>
""" % dict(t, skills=skills, tl=tl, svc=svc, more_list=more, photo=PHOTO)


def contact_footer(t):
    return """<section class='contact' data-stage='contact' id='contact'><div class='wrap'><div class='contact-inner glass' data-reveal='data-reveal'>
<div><span class='kicker'>%(k_contact)s</span><h2>%(h_contact)s</h2><p>%(p_contact)s</p></div>
<div class='actions'><a class='btn' href='mailto:me@hussam.pw'>%(mail)s</a><a class='text-link' href='https://wa.me/96899007996'>%(wa)s</a></div></div></div></section>
<footer class='wrap footer'><span>&#169; <span data-year='true'>2026</span> <data:blog.title/> &#183; %(foot)s</span><a href='/feeds/posts/default'>RSS &#8599;</a><a href='#main-content'>&#8593;</a></footer>""" % t


EN, AR = T['en'], T['ar']

HEAD_SCRIPT = ("(function(){var d=document.documentElement;try{var t=localStorage.getItem('personal-theme');if(t==='light'||t==='dark')d.dataset.theme=t}catch(e){}"
               "d.classList.add('js');var seen=false;try{seen=sessionStorage.getItem('seen')==='1'}catch(e){}"
               "var p=location.pathname,land=(p==='/'||p==='/p/arabic.html'),rm=matchMedia('(prefers-reduced-motion: reduce)').matches;"
               "if(!land||seen||rm){d.classList.add('no-loader')}else{d.classList.add('is-loading')}})();")

IMPORTMAP = '{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}'

WIDGET = open(HERE / 'widget.xml', encoding='utf-8').read()

doc = """<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='1' b:layoutsVersion='3' b:responsive='true' b:templateVersion='1.0' expr:dir='(data:blog.url contains &quot;/p/arabic.html&quot;) ? &quot;rtl&quot; : &quot;ltr&quot;' expr:lang='(data:blog.url contains &quot;/p/arabic.html&quot;) ? &quot;ar&quot; : &quot;en&quot;' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr' xmlns:g='http://www.google.com/2005/gml/g'><head><meta charset='UTF-8'/><meta content='width=device-width, initial-scale=1' name='viewport'/><meta content='#0a0d13' name='theme-color'/><b:include data='blog' name='all-head-content'/>
<title><b:if cond='data:view.isHomepage'><data:blog.title/> | Full-stack Developer &#183; Web &amp; Mobile<b:elseif cond='data:blog.url contains &quot;/p/arabic.html&quot;'/><data:blog.title/> | مطور برمجيات الويب والجوال<b:else/><data:blog.pageName/> | <data:blog.title/></b:if></title>
<b:if cond='!data:blog.metaDescription'><b:if cond='data:view.isHomepage'><meta content='Personal website of a full-stack developer and software designer. Web and mobile projects, programming articles, Linux administration and technical experience.' name='description'/><b:elseif cond='data:blog.url contains &quot;/p/arabic.html&quot;'/><meta content='موقعي الشخصي: تطوير وتصميم برمجيات الويب والجوال. أعمالي وخبراتي وتدوينات البرمجة وإدارة لينكس وقواعد البيانات والتواصل معي.' name='description'/></b:if></b:if>
<b:if cond='data:view.isSearch or data:view.isArchive or data:view.isError'><meta content='noindex,follow' name='robots'/></b:if>
<!-- Enable only after publishing the real Arabic page -->
<b:if cond='false'><link expr:href='data:blog.homepageUrl' hreflang='en' rel='alternate'/><link expr:href='data:blog.homepageUrl + &quot;p/arabic.html&quot;' hreflang='ar' rel='alternate'/><link expr:href='data:blog.homepageUrl' hreflang='x-default' rel='alternate'/></b:if>
<meta expr:content='data:blog.title' property='og:site_name'/><meta expr:content='data:blog.canonicalUrl' property='og:url'/>
<b:if cond='data:view.isPost'><meta content='article' property='og:type'/><b:else/><meta content='website' property='og:type'/></b:if>
<b:if cond='data:view.isHomepage'><meta expr:content='data:blog.title' property='og:title'/><meta content='My software projects, development experience and technical articles.' property='og:description'/><b:else/><meta expr:content='data:blog.pageName' property='og:title'/><b:if cond='data:blog.metaDescription'><meta expr:content='data:blog.metaDescription' property='og:description'/></b:if></b:if>
<b:if cond='data:blog.postImageUrl'><meta expr:content='data:blog.postImageUrl' property='og:image'/><meta content='summary_large_image' name='twitter:card'/><meta expr:content='data:blog.postImageUrl' name='twitter:image'/><b:else/><meta content='%(photo)s' property='og:image'/><meta content='summary' name='twitter:card'/></b:if>
<meta expr:content='data:blog.pageTitle' name='twitter:title'/><b:if cond='data:blog.metaDescription'><meta expr:content='data:blog.metaDescription' name='twitter:description'/></b:if>
<link href='%(logo)s' rel='icon'/><link href='https://fonts.googleapis.com' rel='preconnect'/><link crossorigin='anonymous' href='https://fonts.gstatic.com' rel='preconnect'/><link crossorigin='anonymous' href='https://cdn.jsdelivr.net' rel='preconnect'/><link href='https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..700&amp;family=Rubik:wght@300;400;500;600&amp;family=Tajawal:wght@400;500;700&amp;display=swap' rel='stylesheet'/>
<script><![CDATA[%(head_script)s]]></script>
<script type='importmap'><![CDATA[%(importmap)s]]></script>
<b:skin><![CDATA[
%(css)s
]]></b:skin></head><body>
<a class='skip' href='#main-content'>Skip to content / انتقل إلى المحتوى</a>
<div aria-live='polite' class='loader' id='loader' role='status'><div class='loader-inner'><span><data:blog.title/></span><span class='loader-count'><b id='loader-count'>0</b>%%</span></div><div class='loader-bar'><i></i></div></div>
<div aria-hidden='true' class='curtain' id='curtain'></div><div aria-hidden='true' class='progress'><i id='progress'></i></div><div aria-hidden='true' class='grain'></div>
<canvas aria-hidden='true' id='stage'></canvas>
<b:if cond='%(c_ar)s'>%(header_ar)s<b:else/>%(header_en)s</b:if>
<main id='main-content'>
<b:if cond='%(c_en)s'>%(land_en)s<b:elseif cond='%(c_ar)s'/>%(land_ar)s</b:if>
<b:if cond='data:view.isError'><section class='wrap error'><span class='kicker'>404 / PAGE NOT FOUND</span><h1>This page could not be found.</h1><p>Return home or browse my journal.</p><a class='btn' href='/'>Back to home &#8599;</a></section></b:if>
<b:section class='main' id='main' maxwidgets='1' showaddelement='no'>
%(widget)s
</b:section></main>
<b:if cond='data:blog.url contains &quot;/p/arabic.html&quot;'>%(cf_ar)s<b:else/>%(cf_en)s</b:if>
<script src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'></script>
<script src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js'></script>
<script><![CDATA[
%(ui)s
]]></script>
<script type='module'><![CDATA[
%(scene)s
]]></script>
</body></html>
""" % dict(photo=PHOTO, logo=LOGO, head_script=HEAD_SCRIPT, importmap=IMPORTMAP, css=css,
           c_ar=COND_AR, c_en=COND_EN, header_ar=header(AR), header_en=header(EN),
           land_en=landing(EN), land_ar=landing(AR), widget=WIDGET, cf_ar=contact_footer(AR), cf_en=contact_footer(EN),
           ui=ui_js, scene=scene_js)

out = HERE / 'theme.xml'
out.write_text(doc, encoding='utf-8')
print('wrote', out, len(doc), 'bytes')
