# 🚆 SNCF Real-Time Train Dashboard

A real-time dashboard for visualizing live SNCF train trips using GTFS-RT data. It includes an interactive Leaflet map with animated train icons, current and historical timetable views, and trip statistics.

---

## ✨ Features

- 🔍 **Search by station** to find relevant train trips.
- 🚆 **Live train animation** moving along the active segment.
- 🗺️ **Interactive map** showing:
  - **Gray** lines for passed segments
  - **Blue** lines for upcoming segments
- ⏱️ **Real-time countdown** to the next stop.
- 📊 **Stats panel** for quick analytics.
- 📅 **History view** for past completed trips.
- 🧭 **Auto-centering** on train position when opening the modal.
- 🐳 **Easy Docker deployment**.

---

## 🐳 Run with Docker

### 1. Clone the repository

```bash
git clone https://github.com/faycal-ghozzi/gtfs-rt-dashboard.git
cd gtfs-rt-dashboard
docker compose up --build
```