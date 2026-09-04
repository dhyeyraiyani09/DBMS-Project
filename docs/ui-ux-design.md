# UI/UX Design

## 1. Main Navigation
The application will feature a persistent top navigation bar:
- **Simulator:** Core tool
- **Learn:** Educational content
- **History:** Past runs
- **Help:** User manual
- **Developed By:** Team details
- **Download:** Report export
- **Theme Toggle:** ☀️ Day / 🌙 Night

## 2. Simulator Layout (Desktop)

```text
┌──────────────────────────────────────────────────────────────┐
│  DBMS Index Simulator          Learn  History  Help  [☀️/🌙] │
├────────────────┬────────────────────────┬────────────────────┤
│                │                        │                    │
│ INPUT PANEL    │ VISUALIZATION PANEL    │ EXPLANATION PANEL  │
│                │                        │                    │
│ [Schema JSON/] │ [ Query Flow Graph  ]  │ [ Query Analysis ] │
│ [ Form Input ] │                        │                    │
│                │ [ Candidate Indexes ]  │ [ Recommendation ] │
│ [SQL Query   ] │                        │                    │
│                │ [ Score Chart       ]  │ [ Reasoning text ] │
│ [Existing    ] │                        │                    │
│ [Indexes     ] │ [ EXPLAIN Before/Aft]  │ [ AI Explanation ] │
│                │                        │                    │
│ [ ANALYZE ]    │                        │                    │
├────────────────┴────────────────────────┴────────────────────┤
│                  RESULTS / HISTORY SUMMARY                   │
└──────────────────────────────────────────────────────────────┘
```

## 3. Responsive Design
- **Desktop/Laptop:** 3-column layout as shown above.
- **Tablet:** 2-column layout. Input on left, Visualizations & Explanations stacked on the right.
- **Mobile:** 1-column layout. Accordion or tabbed interface to switch between Input, Visualization, and Explanation views to prevent excessive scrolling.

## 4. Learn Page Structure
The Learn page acts as a mini-textbook suitable for undergraduate students:
1. What is a database index?
2. Why indexes are required (Performance).
3. How indexes work (Lookup mechanisms).
4. B-tree concept (Visual explanation).
5. Single-column vs. Composite indexes.
6. Index selectivity & Cardinality.
7. Query optimization basics.
8. How Index recommendation works.
9. Advantages & Disadvantages.
10. Real-world use cases.
11. Limitations (e.g., write penalties).
12. Educational video embedded.
13. References (Books, Papers, Websites).

## 5. Accessibility Considerations
- **Themes:** High contrast for both Day and Night modes.
- **Keyboard Navigation:** All inputs, buttons, and tabs must be reachable via `Tab`.
- **ARIA:** Proper semantic HTML elements and ARIA roles for screen readers, especially over visualizations where alt-text or data-tables must be provided as fallbacks.
- **Font Size:** Relative units (`rem`) to respect user browser settings.
