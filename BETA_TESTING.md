# CogApp Beta Testing Guide

This checklist covers the complete CogApp experience. Testers should use fake information and non-sensitive sample files. Do not upload real transcripts, passwords, financial documents, or final application essays during beta testing.

## How To Record Results

Mark every test with one result:

- `PASS`: The expected result happened.
- `FAIL`: The feature completed, but something was incorrect.
- `BLOCKED`: The tester could not complete the test.
- `SKIPPED`: The device or browser did not support the test.

Use these severity levels for bugs:

- `P0`: Data loss, another user's data is visible, app cannot load, or signup/login is completely broken.
- `P1`: A major workflow cannot be completed, files cannot be recovered, or repeated crashes/refreshes occur.
- `P2`: A feature behaves incorrectly but has a workaround.
- `P3`: Visual issue, confusing wording, spacing problem, or minor inconvenience.

## Tester Information

- Tester name:
- Date:
- Device:
- Operating system:
- Browser and version:
- Screen size:
- Account username used:
- Network used: Wi-Fi / cellular / offline simulation

## Standard Fake Test Data

Use consistent fake data so screenshots and calculations are easy to compare.

- Alpha University: Reach, EA, deadline 10 days from today, $75 fee.
- Beta College: Target, RD, deadline 30 days from today, $50 fee.
- Gamma State: Safety, RD, deadline 60 days from today, $30 fee.
- Cost example: $40,000 tuition, $10,000 room, $12,000 grants, $20,000 family contribution, $5,500 federal loan.
- Essay A: a 200+ word personal-growth draft with a concrete story.
- Essay B: an empty community prompt with a 250-word limit.
- Document: one PDF or TXT file smaller than 1 MB.
- Oversized file: any disposable file larger than 20 MB.
- Task: "Finish Alpha supplement," due tomorrow, High priority.
- Recommender: "Jordan Teacher," due in 7 days.
- Scholarship: "Beta Test Award," $2,500, due in 14 days.

## Critical Release Pass

Run these tests before every beta release.

- [ ] `CRIT-00` Open the public homepage while logged out and select Get started. Expected: the landing page loads cleanly and the button opens Signup.
- [ ] `CRIT-01` Create a new account with matching passwords. Expected: account is created and onboarding opens.
- [ ] `CRIT-02` Log out and log back in. Expected: the same account opens with its data intact.
- [ ] `CRIT-03` Add Alpha University, refresh the page, and navigate away and back. Expected: the college remains and the app does not repeatedly refresh.
- [ ] `CRIT-04` Select a theme and dark mode, refresh on a page other than Settings. Expected: both appearance choices remain.
- [ ] `CRIT-05` Create Essay A, edit it, and refresh. Expected: title, prompt, text, word count, and status remain.
- [ ] `CRIT-06` Upload the sample document, preview it, download it, and refresh. Expected: the same file remains available.
- [ ] `CRIT-07` Create a full backup. Expected: a JSON backup downloads and includes data plus uploaded files.
- [ ] `CRIT-08` Add temporary data, restore the backup, and reload. Expected: backed-up data and files return without a crash.
- [ ] `CRIT-09` Create a second account. Expected: it cannot see the first account's colleges, essays, files, settings, or notifications.
- [ ] `CRIT-10` Reopen the first account. Expected: its original data is still present.
- [ ] `CRIT-11` Enter Demo Mode, change demo data, then exit. Expected: real account data is unchanged and demo changes disappear.
- [ ] `CRIT-12` Open every sidebar page. Expected: every page loads without a blank screen or console-style error message.
- [ ] `CRIT-13` Use the app at phone width. Expected: navigation, forms, dialogs, and bottom navigation remain usable without horizontal page overflow.
- [ ] `CRIT-14` Disconnect the network, edit text data, refresh, then reconnect. Expected: local data remains and the app recovers without crashing.
- [ ] `CRIT-15` Leave the app open for 10 minutes while navigating and editing. Expected: no random reload loop, theme reset, or disappearing data.

## 1. Signup, Login, And Onboarding

- [ ] `AUTH-00A` Visit `/` while logged out. Expected: the public CogApp homepage opens instead of the private dashboard.
- [ ] `AUTH-00B` Use every Get started button on the public homepage. Expected: each opens Signup.
- [ ] `AUTH-00C` Use Sign in from the header and footer. Expected: each opens Login.
- [ ] `AUTH-00D` Use the Features, How it works, and Privacy links. Expected: the page scrolls to the correct section.
- [ ] `AUTH-00E` Switch Dashboard, Essays, and Costs in the product preview. Expected: the preview changes without navigating away.
- [ ] `AUTH-00F` Open the homepage at phone width. Expected: text, buttons, preview, sections, and footer fit without horizontal scrolling.
- [ ] `AUTH-00G` Visit `/welcome` while logged in. Expected: the app redirects to Dashboard.
- [ ] `AUTH-01` Submit signup with blank fields. Expected: account is not created.
- [ ] `AUTH-02` Use a password shorter than four characters. Expected: a clear validation message appears.
- [ ] `AUTH-03` Use mismatched password confirmation. Expected: "Passwords don't match" appears.
- [ ] `AUTH-04` Try to create the same username twice. Expected: the second attempt reports that the username is taken.
- [ ] `AUTH-05` Enter a wrong password at login. Expected: a clear invalid-login message appears and the app remains usable.
- [ ] `AUTH-06` Press Enter from username and password fields. Expected: the form submits once, not multiple times.
- [ ] `AUTH-07` Refresh while logged in. Expected: the user remains logged in.
- [ ] `AUTH-08` Visit a protected page while logged out. Expected: the app redirects to Login.
- [ ] `AUTH-09` Move forward and backward through onboarding. Expected: every step is readable and ordered correctly.
- [ ] `AUTH-10` Finish onboarding. Expected: Dashboard opens and onboarding does not appear on every refresh.
- [ ] `AUTH-11` Test Skip Tutorial on a fresh account. Expected: Dashboard opens and the account remains usable.
- [ ] `AUTH-12` Log out from desktop and mobile navigation. Expected: the session ends and private pages redirect to Login.

## 2. Navigation, Dashboard, And Global UI

- [ ] `NAV-01` Open every desktop sidebar item. Expected: the active item is highlighted and the correct page opens.
- [ ] `NAV-02` Open and close the mobile navigation drawer. Expected: the overlay closes it and the page does not scroll sideways.
- [ ] `NAV-03` Use every mobile bottom-navigation item. Expected: the correct page opens and active state updates.
- [ ] `NAV-04` Add colleges, essays, documents, fees, and tasks. Expected: Dashboard summary counts update after returning.
- [ ] `NAV-05` Add deadlines and tasks in the future and past. Expected: Next Up sorts them sensibly and labels urgency correctly.
- [ ] `NAV-06` Use Dashboard quick actions. Expected: each opens the intended feature.
- [ ] `NAV-07` Add several documents. Expected: Recent Documents shows the newest relevant items.
- [ ] `NAV-08` Trigger a toast with Undo, then click Undo. Expected: the removed item is restored once.
- [ ] `NAV-09` Open notifications, mark one read, and mark all read. Expected: unread count updates immediately.
- [ ] `NAV-10` Reload on multiple routes. Expected: there is no repeated refresh and the selected theme stays active.

## 3. College List

- [ ] `COL-01` Add Alpha University manually. Expected: it appears with the correct category, type, deadline, fee, and notes.
- [ ] `COL-02` Attempt to add Alpha University again with different capitalization. Expected: duplicate creation is blocked.
- [ ] `COL-03` Search the US college database. Expected: results load or a clear network/error state appears.
- [ ] `COL-04` Choose a database result. Expected: name and available government data populate the add form before saving.
- [ ] `COL-05` Filter by Reach, Target, and Safety. Expected: only matching colleges remain.
- [ ] `COL-06` Search by partial college name. Expected: matching results update correctly.
- [ ] `COL-07` Open View, then Edit. Expected: existing values populate and saved changes appear immediately.
- [ ] `COL-08` Delete a college and use Undo. Expected: it disappears, then returns with its original values.
- [ ] `COL-09` Delete a college without undoing. Expected: other pages do not crash or show broken unnamed records.
- [ ] `COL-10` Use Research from a college row. Expected: Research Hub opens with that college selected.
- [ ] `COL-11` Add 15 or more colleges. Expected: the list remains readable and controls do not overlap.
- [ ] `COL-12` Repeat add, view, edit, and delete at phone width. Expected: every control is reachable.

## 4. College Research Hub

### Compare

- [ ] `RES-01` Select two colleges for comparison. Expected: facts, cost, ratings, pros, and concerns align under the correct college.
- [ ] `RES-02` Select four colleges. Expected: all four appear and the comparison remains scrollable on smaller screens.
- [ ] `RES-03` Attempt to select a fifth college. Expected: selection is blocked with a clear message.
- [ ] `RES-04` Remove a college from comparison. Expected: its column disappears without changing saved research.

### Fit And Rank

- [ ] `RES-05` Select each college from the compact Fit & Rank panel. Expected: only that college's rating editor appears.
- [ ] `RES-06` Rate all five fit categories from 1 to 5. Expected: score and rank update immediately.
- [ ] `RES-07` Change fit-priority weights. Expected: scores and ordering recalculate across all colleges.
- [ ] `RES-08` Set weights to a total other than 100%. Expected: warning appears, but scoring still works.
- [ ] `RES-09` Reset priorities. Expected: default weights return.
- [ ] `RES-10` Add enough colleges to overflow the selector. Expected: the selector scrolls independently and the editor remains focused.
- [ ] `RES-11` Open Research Notes from Fit & Rank. Expected: the same college is selected in the notes panel.

### Notes And Visits

- [ ] `RES-12` Enter program, location, setting, distance, rates, size, pros, concerns, questions, and notes. Expected: values remain after refresh.
- [ ] `RES-13` Switch between colleges in Research Notes. Expected: each college shows only its own saved information.
- [ ] `RES-14` Add cost data, then reopen Research Notes. Expected: estimated net cost displays for the correct college.
- [ ] `RES-15` Add, edit, and delete a campus visit. Expected: visit list updates and remains correct after refresh.
- [ ] `RES-16` Add an interview with contact, follow-up, rating, and thank-you status. Expected: all fields save correctly.
- [ ] `RES-17` Create an upcoming visit. Expected: it appears in notifications within the selected reminder window.
- [ ] `RES-18` Test all Research Hub tabs on mobile. Expected: tabs scroll, selectors remain usable, and forms stack cleanly.

## 5. Application Command Center

### Applications

- [ ] `APP-01` Add three colleges, then open Applications. Expected: each college automatically receives an application record and default checklist.
- [ ] `APP-02` Expand and collapse each college. Expected: only the selected details open and no values are lost.
- [ ] `APP-03` Save submission date, decision date, portal URL, portal username, and decision notes. Expected: all values survive refresh.
- [ ] `APP-04` Enter a portal URL without `https://`, then open it. Expected: the link opens as HTTPS in a new tab.
- [ ] `APP-05` Change application status through the full lifecycle. Expected: status styling and saved value update correctly.
- [ ] `APP-06` Mark an incomplete application Submitted. Expected: a visible warning identifies remaining checklist work.
- [ ] `APP-07` Complete all required items. Expected: progress reaches 100% and Mark Ready becomes available.
- [ ] `APP-08` Mark a default requirement Not Needed, then restore automatic tracking. Expected: progress recalculates correctly.
- [ ] `APP-09` Add, update, and delete a custom checklist requirement. Expected: only that college changes.
- [ ] `APP-10` Give a checklist item a custom date. Expected: Calendar uses the custom date instead of the college deadline.
- [ ] `APP-11` Mark a college essay Done. Expected: Supplemental Essays automatic checklist status updates.
- [ ] `APP-12` Add submitted recommendations. Expected: Recommendation Letters automatic status updates.

### Tasks

- [ ] `APP-13` Create the standard task with due date, priority, reminder, and notes. Expected: it appears in Open tasks.
- [ ] `APP-14` Edit the task and change its college, date, priority, and status. Expected: all changes save.
- [ ] `APP-15` Filter Open, All, and Done tasks. Expected: each filter shows the correct records.
- [ ] `APP-16` Link a task to an essay, checklist item, recommendation, and document. Expected: labels and Open actions point to the correct source.
- [ ] `APP-17` Complete a linked resource. Expected: the task indicates that the linked resource is complete where supported.
- [ ] `APP-18` Delete a task and use Undo. Expected: the exact task returns.

### Recommendations And Calendar

- [ ] `APP-19` Add a recommender with role, email, colleges, dates, status, notes, and thank-you state. Expected: everything saves.
- [ ] `APP-20` Edit and delete the recommender. Expected: linked status calculations remain stable.
- [ ] `APP-21` Use the email action. Expected: the device opens a correctly addressed email draft.
- [ ] `APP-22` Move between calendar months. Expected: month boundaries and weekday alignment are correct.
- [ ] `APP-23` Confirm college deadlines, tasks, checklist dates, visits, scholarships, and recommendations appear on the correct day.
- [ ] `APP-24` Select a day and create a task from it. Expected: the form opens with that date prefilled.

## 6. Essay Tracker And Essay Editor

- [ ] `ESS-01` Open a college and set an essay target. Expected: target and progress remain after refresh.
- [ ] `ESS-02` Add, edit, and delete a college essay. Expected: the correct college totals update.
- [ ] `ESS-03` Select and deselect Common App prompts. Expected: essay records and Common App totals update correctly.
- [ ] `ESS-04` Add scholarship, award, competition, fellowship, and other essay types. Expected: each is labeled and filtered correctly.
- [ ] `ESS-05` Type Essay A in Write mode. Expected: word count updates live and text autosaves.
- [ ] `ESS-06` Change title and status. Expected: values remain after navigation and refresh.
- [ ] `ESS-07` Mark an essay Done. Expected: completion state updates in Dashboard, Stats, Goals, and Applications.
- [ ] `ESS-08` Run the quick writing check. Expected: counts, repeated words, passive hints, and word-limit guidance appear without changing text.
- [ ] `ESS-09` Upload a PDF, DOC, DOCX, or TXT attachment under 20 MB. Expected: attachment saves and downloads.
- [ ] `ESS-10` Attempt an attachment larger than 20 MB. Expected: upload is blocked with a clear size message.
- [ ] `ESS-11` Switch an attached essay back to Write mode and type. Expected: the app does not keep a misleading stale attachment.
- [ ] `ESS-12` Open the Essay Coach directly from a draft. Expected: AI Studio selects the same essay.
- [ ] `ESS-13` Use Back from a Common App, college, and other essay. Expected: each returns to a sensible essay page.
- [ ] `ESS-14` Edit a long draft on mobile. Expected: textarea, status buttons, word count, and coach actions remain reachable.

## 7. AI Studio

- [ ] `AI-01` Open AI Studio with no essays. Expected: helpful empty states appear and no crash occurs.
- [ ] `AI-02` Create Essay A and Essay B, then run Reuse Mapper for Essay B. Expected: Essay A appears as a candidate when it has at least 40 characters of text.
- [ ] `AI-03` Compare prompts with shared and unrelated themes. Expected: match order, themes, cautions, and adaptation plan change sensibly.
- [ ] `AI-04` Open source and target drafts from the mapper. Expected: the correct essay opens.
- [ ] `AI-05` Coach an empty draft. Expected: it recommends starting without inventing essay content.
- [ ] `AI-06` Coach Essay A. Expected: score, prompt fit, specificity, voice, clarity, structure, length, strengths, and revision actions appear.
- [ ] `AI-07` Edit Essay A and reopen Coach. Expected: analysis changes based on the new text.
- [ ] `AI-08` Select an attached-only essay. Expected: Coach explains that pasted text is required.
- [ ] `AI-09` Open Application Advisor with no colleges, then with the standard three colleges. Expected: empty guidance becomes a readiness report.
- [ ] `AI-10` Add missing deadlines, incomplete essays, overdue tasks, and pending recommendations. Expected: priority actions identify each problem and open the relevant page.
- [ ] `AI-11` Change Reach/Target/Safety balance. Expected: portfolio strategy responds without claiming to predict admission.
- [ ] `AI-12` Test all three AI tabs on mobile. Expected: tabs, selectors, scores, and action lists remain readable.

## 8. Majors And Minors

- [ ] `MAJ-01` Search and filter the majors catalog. Expected: results match the query and category.
- [ ] `MAJ-02` Add and rank up to three major choices. Expected: order and details save.
- [ ] `MAJ-03` Add and rank up to three minor choices. Expected: majors and minors remain separate.
- [ ] `MAJ-04` Save a specific concentration, reason for interest, career goals, and notes. Expected: values return when editing.
- [ ] `MAJ-05` Add a custom major. Expected: it appears in the catalog and can be selected.
- [ ] `MAJ-06` Edit and delete a top pick. Expected: rankings update without duplicate or missing ranks.
- [ ] `MAJ-07` Refresh and log back in. Expected: custom majors and top picks remain.

## 9. Brag Sheet

- [ ] `BRAG-01` Add multiple SAT attempts and enable superscoring. Expected: best Math and Reading combine correctly.
- [ ] `BRAG-02` Add ACT attempts and goals. Expected: highest score and goal progress calculate correctly.
- [ ] `BRAG-03` Add and edit GPA, courses, AP scores, clubs, sports, service/work, awards, portfolio, skills, and family context.
- [ ] `BRAG-04` Confirm each category displays the correct fields and saved values.
- [ ] `BRAG-05` Add multi-year participation where offered. Expected: selected years remain.
- [ ] `BRAG-06` Attach a file to a supported Brag Sheet field. Expected: it downloads and appears in Document Vault.
- [ ] `BRAG-07` Replace or clear an attachment. Expected: stale file references do not remain.
- [ ] `BRAG-08` Add a custom category and custom entries. Expected: both remain after refresh.
- [ ] `BRAG-09` Delete a custom category containing entries. Expected: the category and its entries disappear without affecting default categories.
- [ ] `BRAG-10` Delete a normal item and respond to the confirmation dialog. Expected: Cancel keeps it; confirming removes it and any attached file reference.
- [ ] `BRAG-11` Test long descriptions and unusual punctuation. Expected: text wraps and saves without layout breakage.

## 10. Document Vault

- [ ] `DOC-01` Upload the sample PDF or TXT with type, description, colleges, and date. Expected: metadata and file save.
- [ ] `DOC-02` Preview the file. Expected: supported content opens correctly or a clear fallback appears.
- [ ] `DOC-03` Download the file. Expected: filename and contents match the upload.
- [ ] `DOC-04` Edit document metadata. Expected: the file remains attached and metadata updates.
- [ ] `DOC-05` Search by filename, type, source, description, and college. Expected: matching documents appear.
- [ ] `DOC-06` Filter documents by source/type where available. Expected: counts and results are correct.
- [ ] `DOC-07` Confirm essay and Brag Sheet attachments appear automatically with the correct source label.
- [ ] `DOC-08` Attempt to edit or delete a linked essay/Brag attachment from Vault. Expected: the app explains that it must be changed at its source.
- [ ] `DOC-09` Delete a Vault-owned document. Expected: metadata and file disappear.
- [ ] `DOC-10` Upload an oversized file. Expected: the 20 MB limit is enforced without freezing the app.
- [ ] `DOC-11` Upload files with spaces, long names, and common punctuation. Expected: names remain readable and downloads work.
- [ ] `DOC-12` Refresh, log out/in, and test on a second browser/device. Expected: cloud-synced files can be recovered.

## 11. Costs, Scholarships, Goals, And Stats

### Costs

- [ ] `COST-01` Add the standard cost example. Expected: sticker total is $50,000, net cost is $38,000, and gap is $18,000.
- [ ] `COST-02` Confirm federal and private loans total correctly and interest rate displays.
- [ ] `COST-03` Select a real college while online. Expected: government cost data auto-fills when available; failure does not block manual entry.
- [ ] `COST-04` Edit and delete a cost card. Expected: summary totals update immediately.
- [ ] `COST-05` Mark a scholarship Won. Expected: Scholarship Money Won updates on Cost Tracker.
- [ ] `COST-06` Add cost data for multiple colleges. Expected: each remains tied to the correct college.

### Scholarships

- [ ] `SCH-01` Search and filter built-in scholarships by status, type, effort, deadline, and match.
- [ ] `SCH-02` Add, edit, and delete a custom scholarship. Expected: all eligibility, award, link, notes, and deadline fields save.
- [ ] `SCH-03` Customize a sample scholarship. Expected: customization remains in Your Scholarships.
- [ ] `SCH-04` Remove a sample from Yours. Expected: it stays removed after refresh without deleting unrelated scholarships.
- [ ] `SCH-05` Change status through Not Started, In Progress, Submitted, Won, and Rejected. Expected: dashboard amounts recalculate.
- [ ] `SCH-06` Complete, reset, and add custom material checklist items. Expected: progress is accurate.
- [ ] `SCH-07` Link and unlink Vault documents. Expected: only links change; original documents remain.
- [ ] `SCH-08` Link and unlink essays. Expected: only links change; original essays remain.
- [ ] `SCH-09` Use AI Help prompts and custom questions. Expected: a relevant built-in response and short history appear.
- [ ] `SCH-10` Open an application link. Expected: it opens safely in a new tab.
- [ ] `SCH-11` Review scam warnings and match badges. Expected: they respond sensibly to scholarship data.
- [ ] `SCH-12` Confirm a due-in-14-days active scholarship appears in notifications.

### Goals And Stats

- [ ] `GOAL-01` Create goals for applications submitted, essays, total application fees, scholarship money won, SAT, ACT, tuition, and a custom target.
- [ ] `GOAL-02` Change source data. Expected: automatic goal progress updates correctly.
- [ ] `GOAL-03` Edit and delete goals. Expected: no unrelated data changes.
- [ ] `GOAL-04` Confirm tuition goals classify colleges using net cost data.
- [ ] `STAT-01` Compare Stats values with College List, Essays, Documents, Scholarships, fees, and Brag Sheet test scores.
- [ ] `STAT-02` Add and remove records. Expected: charts and quick facts update without negative or impossible values.
- [ ] `STAT-03` Test Stats with no data and with many records. Expected: both states remain readable.

## 12. Settings, Notifications, Review, Demo, And Backup

### Settings And Themes

- [ ] `SET-01` Copy account ID. Expected: clipboard receives the full Firebase account ID or a clear blocked-clipboard message appears.
- [ ] `SET-02` Select Lilac, Ocean, Forest, and Rose. Expected: buttons, active controls, progress, focus states, and navigation change consistently.
- [ ] `SET-03` Enable dark mode under every theme. Expected: text remains readable and controls retain sufficient contrast.
- [ ] `SET-04` Refresh from Dashboard, Colleges, Applications, Essays, Costs, and Settings. Expected: theme never resets to white unexpectedly.
- [ ] `SET-05` Test keyboard focus on buttons, inputs, tabs, and selects. Expected: the focused control is clearly visible.

### Notifications

- [ ] `NOT-01` Turn in-app reminders off. Expected: the notification list and badge clear.
- [ ] `NOT-02` Test 7, 14, 30, and 60 day reminder windows. Expected: only dates inside the selected window appear.
- [ ] `NOT-03` Create overdue, due-today, 3-day, 7-day, and 30-day items. Expected: urgency labels and sorting are correct.
- [ ] `NOT-04` Confirm deadlines can originate from colleges, tasks, recommendations, scholarships, and visits.
- [ ] `NOT-05` Mark notifications read, reload, and reopen. Expected: read state remains for active notifications.
- [ ] `NOT-06` Enable browser alerts and grant permission. Expected: urgent alerts appear while CogApp is open and are not repeated constantly.
- [ ] `NOT-07` Deny browser permission. Expected: the app explains the result and keeps in-app reminders usable.
- [ ] `NOT-08` Click a notification. Expected: it marks read and opens the correct destination.

### Parent/Counselor View

- [ ] `REV-01` Open review view. Expected: application progress, upcoming dates, and supporting-material counts are accurate.
- [ ] `REV-02` Confirm essay text, document contents, portal URLs/usernames, and private notes are hidden.
- [ ] `REV-03` Toggle financial estimates in Settings. Expected: Financial Snapshot appears only when enabled.
- [ ] `REV-04` Save a reviewer note. Expected: it appears in Review and remains after refresh.
- [ ] `REV-05` Print the review. Expected: navigation is hidden and the summary prints cleanly.

### Demo And Backup

- [ ] `DEMO-01` Enter Demo Mode. Expected: sample colleges, essays, applications, costs, research, goals, and Brag data appear.
- [ ] `DEMO-02` Edit and delete demo records. Expected: real account records do not change.
- [ ] `DEMO-03` Confirm browser notifications are not delivered from Demo Mode.
- [ ] `DEMO-04` Exit Demo Mode. Expected: demo data is removed and real data returns.
- [ ] `BACK-01` Export from Dashboard and Settings. Expected: both produce a full version 2 backup.
- [ ] `BACK-02` Restore a valid backup. Expected: supported data and files return after reload.
- [ ] `BACK-03` Attempt to restore an unrelated or malformed JSON file. Expected: a clear error appears and current data remains intact.
- [ ] `BACK-04` Restore a backup created by another beta account. Expected: data imports only after confirmation and remains inside the currently signed-in account.

## 13. Persistence, Offline, Multi-Account, And Cross-Device

- [ ] `DATA-01` Create records in every major feature, refresh, and verify all records remain.
- [ ] `DATA-02` Log out and back in after at least one minute. Expected: all records remain.
- [ ] `DATA-03` Close and reopen the browser. Expected: the login session and account data recover.
- [ ] `DATA-04` Create Account A data, then Account B data. Expected: neither account ever displays the other's information.
- [ ] `DATA-05` Change Account A's theme and preferences. Expected: Account B keeps its own appearance and settings.
- [ ] `DATA-06` Make edits while offline. Expected: text data and files save locally without a crash.
- [ ] `DATA-07` Reconnect after offline edits. Expected: pending data synchronizes without replacing newer local work.
- [ ] `DATA-08` Sign into the same account in another supported browser/device. Expected: synchronized data appears after login/reload.
- [ ] `DATA-09` Upload a file on Device A, then open it on Device B after sync. Expected: the file downloads or a clear pending-sync state is reported.
- [ ] `DATA-10` Edit the same record on two devices in close succession. Record exactly which version wins and whether any change disappears.
- [ ] `DATA-11` Leave the app open through a network interruption. Expected: no repeated reload loop occurs.
- [ ] `DATA-12` Confirm Demo Mode data never appears on another device or in the real account namespace.

## 14. Mobile, Accessibility, And Stress Testing

- [ ] `UX-01` Test at approximately 375 px, 768 px, 1024 px, and desktop width.
- [ ] `UX-02` Rotate a phone between portrait and landscape. Expected: no clipped dialogs or unreachable buttons.
- [ ] `UX-03` Open every modal on a small screen. Expected: it fits the viewport and its content scrolls internally.
- [ ] `UX-04` Test long college, essay, scholarship, document, and recommender names. Expected: text wraps or truncates without covering controls.
- [ ] `UX-05` Increase browser text zoom to 200%. Expected: core workflows remain usable.
- [ ] `UX-06` Navigate forms with Tab, Shift+Tab, Enter, Space, and Escape where supported.
- [ ] `UX-07` Confirm icon-only controls have an accessible label or tooltip.
- [ ] `UX-08` Test light and dark themes for readable error, warning, success, and disabled states.
- [ ] `UX-09` Rapidly click Save once on a slow network. Expected: one record is created, not duplicates.
- [ ] `UX-10` Add 25 colleges, 50 essays, 50 tasks, 25 documents, and 50 scholarships. Expected: pages remain responsive and usable.
- [ ] `UX-11` Paste a very long essay and long notes. Expected: autosave works and the app does not freeze.
- [ ] `UX-12` Use browser Back and Forward across forms and detail pages. Expected: navigation remains coherent and no data is silently discarded.

## Known Beta Boundaries

These are current product boundaries, not automatic failures:

- AI Studio uses private on-device analysis. It is not connected to a paid generative AI provider yet.
- Browser notifications work while CogApp is open; they are not background push notifications.
- Parent/Counselor View is a read-only view inside the student's account, not a separate invited reviewer account yet.
- Government college and cost lookups require internet access and may occasionally return incomplete source data.
- Attached essay documents must be pasted into Write mode before AI Studio can analyze their text.

## Bug Report Template

```text
Title:
Test ID:
Severity: P0 / P1 / P2 / P3
Device and browser:
Account username:

What I was trying to do:

Steps to reproduce:
1.
2.
3.

Expected result:

Actual result:

Does it happen every time? Yes / No / Sometimes
Did refreshing change the result? Yes / No
Did any data disappear? Yes / No

Screenshot or screen recording:
Extra notes:
```

## Final Tester Sign-Off

- [ ] I completed the Critical Release Pass.
- [ ] I tested at least one desktop layout.
- [ ] I tested at least one mobile layout.
- [ ] I tested refresh and logout/login persistence.
- [ ] I tested with at least one uploaded file.
- [ ] I tested a second account or confirmed why I could not.
- [ ] I submitted every P0 and P1 bug with reproduction steps.
- Overall confidence from 1 to 10:
- Would I trust CogApp with a full fake application plan? Yes / No
- The single most confusing part was:
- The single most valuable feature was:
