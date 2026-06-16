# Curtain House Back Office + Web-POS + Online Catalog

Curtain House is now a web-only system with three connected surfaces:

- Back Office website at `https://pos.curtainhousett.com/`
- Web-POS at `https://pos.curtainhousett.com/web-pos`
- Online Catalog at `https://pos.curtainhousett.com/catalog`

The former mobile app build has been removed from this project.

## Features

- Role-based login for Admin, Manager, and Sales Associate
- Web-POS sales, receipts, shifts, items, settings, online catalog, and orders
- Product catalog with category filters, search, SKU/barcode lookup, photos, and catalog visibility switches
- Online Catalog with business information, WhatsApp order link, customer order form, and product photos from items
- Orders list and order detail for online catalog orders
- Card, cash, transfer, and other checkout support
- Printable receipts, receipt history, and refunds
- Inventory management, stock adjustments, and low-stock alerts
- Customer profiles and employee access management
- Shift tracking, expected cash, and cash drawer movements
- Back Office reports, dashboard, settings, and future workflow modules
- Netlify Functions sync for Back Office, Web-POS, and Online Catalog data

## Deploy To Netlify

Create or connect a Netlify site from this folder. No build command is required;
Netlify publishes the project root directly and uses the functions in
`netlify/functions`.

## Logins

- Admin: `admin` / `admin123`
- Manager: `manager` / `manager123`
- Sales Associate: `sales` / `sales123`

For Web-POS staff access, use the shared POS account and employee PINs configured
from Back Office.
