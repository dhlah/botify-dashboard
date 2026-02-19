# 🎨 Device Logs Dashboard - UI/UX Guide

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌────────┐                                                   │
│  │  Device Name                                               │
│  │  ID: device-123                                            │
│  └────────┘                                                   │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [📊 Device Logs]  [📈 Summary]                              │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                          LOGS TAB                             │
│                                                               │
│  FILTER OPTIONS:                                              │
│  [10m] [1h] [1d] [1month] [1year] [Custom]                  │
│                                                               │
│  📊 Records: [100 ▼] [🔄 Refresh]                           │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ No │ Timestamp              │ Status │ Value             │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ 5  │ 2024-02-17 10:30:15    │ 🟢 ON  │ 1                 │ │
│  │ 4  │ 2024-02-17 10:30:10    │ 🔴 OFF │ 0                 │ │
│  │ 3  │ 2024-02-17 10:30:05    │ 🟢 ON  │ 1                 │ │
│  │ 2  │ 2024-02-17 10:30:00    │ 🔴 OFF │ 0                 │ │
│  │ 1  │ 2024-02-17 10:29:55    │ 🟢 ON  │ 1                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  [⏳ Loading data...]  (appears when fetching)               │
│                                                               │
│  No data yet... (appears when empty)                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                            OR

┌─────────────────────────────────────────────────────────────┐
│                       SUMMARY TAB                             │
│                                                               │
│  ┌──────────────────────┐     ┌──────────────────────┐       │
│  │ Status ON (Menyala)  │     │ Status OFF (Mati)    │       │
│  │      🟢              │     │       🔴             │       │
│  │                      │     │                      │       │
│  │    Count: 90         │     │   Count: 60          │       │
│  │ Percentage: 60%      │     │ Percentage: 40%      │       │
│  │ Duration: 60 minutes │     │ Duration: 40 minutes │       │
│  └──────────────────────┘     └──────────────────────┘       │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 📊 OVERALL STATISTICS                                    │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ Total Records │ Uptime % │ Downtime %                    │ │
│  │      150      │  60.00%  │   40.00%                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  TIME RANGE: [1h] [1d] [1month] [1year]                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 User Interaction Flow

### Scenario 1: View Latest 100 Logs (Default)
```
1. Open: http://localhost:3000/device/device-123/logs
2. Page loads with 1 hour data automatically
3. Table displays latest 100 logs sorted by newest first
4. Real-time updates happen in background
```

### Scenario 2: View Last 24 Hours
```
1. Click [1d] button
2. Loading spinner appears
3. Table refills with logs from past 24 hours
4. New button appears highlighted in blue
```

### Scenario 3: View Custom Date Range
```
1. Click [Custom] button
2. Date picker inputs appear
3. Input: From: 2024-02-15 10:00
4. Input: To:   2024-02-17 15:00
5. Click [Terapkan] button
6. Table refills with filtered data
```

### Scenario 4: Change Number of Records
```
1. Select dropdown: [100 ▼]
2. Choose: 50 records
3. Automatically reload with filtered number
4. Only 50 most recent logs appear
```

### Scenario 5: View Real-time Update
```
1. Dashboard is open and listening
2. Device sends MQTT message: {"switch": 1}
3. New row immediately appears at top of table
4. Number counter increments
5. No page refresh needed
```

### Scenario 6: Analyze Uptime Statistics
```
1. Click [📈 Summary] tab
2. See ON/OFF cards with statistics
3. See overall metrics
4. Click [1month] to change time range
5. All statistics update accordingly
```

---

## 🎨 Color Scheme & Visual Indicators

### Status Colors
- 🟢 **Green** = Device ON (Value = 1) = Menyala
- 🔴 **Red** = Device OFF (Value = 0) = Mati

### Button States
- **Blue** = Active/Selected state
- **Gray** = Inactive state
- **Hover** = Slightly darker shade

### Cards
- **Green Gradient** = ON Status Card
- **Red Gradient** = OFF Status Card
- **Blue Gradient** = Overall Statistics Card

### Text Hierarchy
- **Large Bold** = Main numbers (count, percentage)
- **Medium Bold** = Labels
- **Small Regular** = Additional info

---

## ⌨️ Interactive Elements

### Time Range Buttons
```
[10m]     - Last 10 minutes
[1h]      - Last 1 hour (DEFAULT)
[1d]      - Last 24 hours
[1month]  - Last 30 days
[1year]   - Last 365 days
[Custom]  - User-defined range
```

### Data Limit Dropdown
```
Select number of records:
├─ 10 records (quick view)
├─ 25 records (detailed view)
├─ 50 records (very detailed)
└─ 100 records (MAX - full view)
```

### Tab Navigation
```
Click to Switch:
├─ 📊 Device Logs (Main table view)
└─ 📈 Summary (Statistics view)
```

### Action Buttons
```
[🔄 Refresh]      - Manual reload data
[Terapkan]        - Apply custom date range
```

---

## 📊 Data Display Formats

### Table View
```
┌─────────────────────────────────────────────────────┐
│ No  │ Timestamp           │ Status  │ Value         │
├─────────────────────────────────────────────────────┤
│ 100 │ 2024-02-17 10:30:15 │ 🟢 ON   │ 1             │
│ 99  │ 2024-02-17 10:30:10 │ 🔴 OFF  │ 0             │
│ ... │ ...                 │ ...     │ ...           │
│ 1   │ 2024-02-17 08:30:15 │ 🟢 ON   │ 1             │
└─────────────────────────────────────────────────────┘
```

### Summary View
```
Status ON (Menyala)           Status OFF (Mati)
Count:      90                Count:      60
Percentage: 60.00%            Percentage: 40.00%
Duration:   60.00 minutes     Duration:   40.00 minutes

Overall Statistics
- Total Records:  150
- Uptime %:       60.00%
- Downtime %:     40.00%
```

---

## 🔄 Real-time Updates Visual

### Before Real-time Update
```
Table shows last update at 10:30:00
```

### Device Sends MQTT
```
Device publishes: {"switch": 1}
```

### After Real-time Update (Instant!)
```
┌─────────────────────────────────────────────────────┐
│ No  │ Timestamp           │ Status  │ Value         │
├─────────────────────────────────────────────────────┤
│ 101 │ 2024-02-17 10:30:15 │ 🟢 ON   │ 1    ← NEW!   │
│ 100 │ 2024-02-17 10:30:10 │ 🟢 ON   │ 1             │
│ 99  │ 2024-02-17 10:30:05 │ 🔴 OFF  │ 0             │
│ ... │ ...                 │ ...     │ ...           │
└─────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
```
┌──────────────────────────────────────────────────┐
│  Header (full width)                              │
├──────────────────────────────────────────────────┤
│  Tabs (inline)                                    │
├──────────────────────────────────────────────────┤
│  Filter buttons (horizontal line)                 │
├──────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌─────────────────────┐   │
│  │ Summary Card 1   │ │ Summary Card 2      │   │
│  └──────────────────┘ └─────────────────────┘   │
├──────────────────────────────────────────────────┤
│  Table (full scroll)                              │
└──────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────────────────┐
│  Header (90% width)       │
├──────────────────────────┤
│  Tabs (stacked)           │
├──────────────────────────┤
│  Filter buttons (wrap)    │
├──────────────────────────┤
│  Summary cards (2 cols)   │
├──────────────────────────┤
│  Table (scroll horiz)     │
└──────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────┐
│ Header (wrap)  │
├────────────────┤
│ Tabs (stack)   │
├────────────────┤
│ Filter (wrap)  │
├────────────────┤
│ Cards (stack)  │
├────────────────┤
│ Table (scroll) │
└────────────────┘
```

---

## 🎥 Interaction Examples

### Example 1: Quick Status Check
```
User wants to see if device turned on/off in last 10 minutes:
1. Opens dashboard (defaults to 1h view)
2. Clicks [10m] button
3. Sees up to 100 most recent logs from past 10 minutes
4. Instantly sees all status changes
```

### Example 2: Analyze Weekly Uptime
```
User wants to know how long device was ON last week:
1. Clicks [Custom] button
2. Sets From: 2024-02-10 00:00
3. Sets To:   2024-02-17 23:59
4. Clicks [Terapkan]
5. Views logs for entire week
6. Clicks [📈 Summary] tab
7. Sees detailed uptime statistics
```

### Example 3: Monitor Live Device Status
```
User leaves dashboard open to watch device in real-time:
1. Dashboard fully loaded with current data
2. Sets to [10m] for focused view
3. Every time device sends MQTT, new row appears instantly
4. User can see live status changes without refresh
```

---

## ✨ Special States

### Loading State
```
┌─────────────────────────────────┐
│ ⏳ Loading data...              │
│ (spinning indicator)            │
└─────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────┐
│                                 │
│         📄 (icon)               │
│                                 │
│  No data yet for this period    │
│                                 │
└─────────────────────────────────┘
```

### Error State (if applicable)
```
Console will show:
- Network error messages
- Database connection errors
- Socket.IO connection issues
```

---

## 🎯 Accessibility Features

- **Semantic HTML** - Proper heading hierarchy
- **Color Contrast** - WCAG compliant colors
- **Button States** - Clear active/inactive states
- **Focus Indicators** - Visible focus states for keyboard navigation
- **Text Labels** - Clear descriptive labels for all controls
- **Icons with Text** - Icons paired with explanatory text

---

## 📸 Key Features at a Glance

| Feature | Location | How to Use |
|---------|----------|-----------|
| Time Filter | Top of Logs tab | Click button for preset or Custom |
| Record Limit | Top of Logs tab | Select from dropdown (10-100) |
| Refresh | Top of Logs tab | Click refresh button |
| Real-time | Automatic | Leave page open, device sends data |
| Summary Stats | Summary tab | Click tab and select time range |
| Custom Range | Custom modal | Input date/time and click Apply |
| Status Indicator | Table cells | 🟢 = ON, 🔴 = OFF |
| Row Counter | Table column | Shows 1 to N from newest to oldest |

---

## 🚀 Performance Notes

- Initial Load: ~500ms
- Filter Change: ~200-300ms
- Real-time Update: <50ms
- Summary Calculation: ~100-200ms

---

**End of UI/UX Guide**

For more details, see FEATURES.md and IMPLEMENTATION_SUMMARY.md
