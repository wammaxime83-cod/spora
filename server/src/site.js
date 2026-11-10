'use strict';
/* Sert le site Next.js exporté (web/out) : remplace {{SITE_URL}}, applique une CSP stricte par page
   (les petits scripts intégrés par Next sont autorisés un à un grâce à leur empreinte sha256, sans 'unsafe-inline'). */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const config = require('./config');

function walk(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.posix.join(base, e.name);
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel)); else out.push(rel);
  }
  return out;
}

function loadPages(root) {
  const pages = new Map();                       // '/joueurs/' -> { html, hashes }
  if (!fs.existsSync(root)) return pages;
  for (const rel of walk(root)) {
    if (!rel.endsWith('.html') || rel === '404.html' && false) continue;
    const html = fs.readFileSync(path.join(root, rel), 'utf8').replaceAll('{{SITE_URL}}', config.siteUrl);
    const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => `'sha256-${crypto.createHash('sha256').update(m[1]).digest('base64')}'`);
    const url = rel === 'index.html' ? '/' : rel === '404.html' ? '/404.html' : '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '/');
    pages.set(url, { html, hashes: [...new Set(hashes)] });
  }
  return pages;
}

function cspHeader(scriptHashes = []) {
  const d = {
    'default-src': ["'self'"],
    'script-src': ["'self'", ...scriptHashes],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
    'media-src': ["'self'", 'blob:', 'https://res.cloudinary.com'],
    'connect-src': ["'self'", 'https://api.cloudinary.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  if (config.isProd) d['upgrade-insecure-requests'] = [];
  return Object.entries(d).map(([k, v]) => [k, ...v].join(' ')).join('; ');
}

function siteRouter() {
  const root = config.publicDir, pages = loadPages(root), r = express.Router();
  const NOINDEX = new Set(['/admin/', '/espace/', '/reinitialiser/']);
  const send = (res, url, status = 200) => {
    const p = pages.get(url); if (!p) return false;
    res.status(status).type('html').set({ 'Cache-Control': 'no-cache', 'Content-Security-Policy': cspHeader(p.hashes) });
    if (NOINDEX.has(url)) res.set('X-Robots-Tag', 'noindex');
    res.send(p.html); return true;
  };
  r.get('/robots.txt', (req, res) => res.type('text/plain').send(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8').replaceAll('{{SITE_URL}}', config.siteUrl)));
  r.get('/sitemap.xml', (req, res) => {
    const urls = [...pages.keys()].filter(u => !NOINDEX.has(u) && u !== '/404.html');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${config.siteUrl}${u}</loc></url>`).join('')}</urlset>`);
  });
  r.use(express.static(root, { index: false, redirect: false, maxAge: config.isProd ? '1d' : 0, setHeaders: (res, p) => {
    if (/\.(html|webmanifest)$/.test(p)) res.set('Cache-Control', 'no-cache');
    if (p.includes(`${path.sep}_next${path.sep}static${path.sep}`)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
  } }));
  r.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const u = req.path;
    if (u !== '/' && !u.endsWith('/') && pages.has(u + '/')) return res.redirect(301, u + '/' + (req.url.slice(req.path.length)));   // /joueurs -> /joueurs/
    if (u === '/index.html') return res.redirect(301, '/');
    if (send(res, u)) return;
    if (pages.has('/404.html')) return send(res, '/404.html', 404) || next();
    next();
  });
  return r;
}

module.exports = { siteRouter, cspHeader };
