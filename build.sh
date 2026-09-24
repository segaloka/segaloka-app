cd /home/claude/sg
cat i18n.js data.js core.js pages_a.js pages_b.js pages_c.js main.js pages_d.js pages_e.js pages_f.js pages_g.js portals.js segadeals.js datamode.js sync.js boot.js > _all.js && node --check _all.js || exit 1
{ cat <<'H'
<meta charset="utf-8">
<title>SEGALOKA Control Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>
H
cat styles.css; echo '</style>'; echo '<div id="root" style="height:100%"></div>'; echo '<script>'; cat _all.js; echo '</script>'; } > segaloka-control-center.html
wc -c segaloka-control-center.html
