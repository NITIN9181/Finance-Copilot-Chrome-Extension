# Requirements Document

## Introduction

Finance Copilot is a Chrome browser extension that injects an AI-powered overlay onto legacy ERP dashboards (QuickBooks-style interfaces). The extension detects financial data tables on a webpage, renders a floating copilot panel, and offers three capabilities: automatic flux (variance) analysis, natural-language chat about the visible financial data powered by the NVIDIA NIM API, and a static "Simulate DualEntry Migration" comparison view.

The project also includes a self-contained demo site that simulates a QuickBooks-style ERP dashboard for "Meridian Supply Co." with four quarters of FY2024 P&L data. The demo site allows reviewers to observe the full experience without configuring a real ERP, and the extension auto-activates on the demo page.

This is a portfolio/demo project intended to showcase browser engineering and AI orchestration skills, deployable to Vercel for public access.

## Glossary

- **Finance_Copilot**: The Chrome extension as a whole, comprising the content script, popup, background service worker, and overlay UI.
- **Content_Script**: The Plasmo content script that runs in the context of a webpage, responsible for table detection, data extraction, and overlay injection.
- **Background_Worker**: The extension background service worker responsible for making authenticated calls to the NVIDIA NIM API.
- **Popup**: The extension popup UI where the user enters and saves the NVIDIA NIM API key.
- **Copilot_Overlay**: The floating panel injected over the host page that contains the flux analysis, chat, and migration features.
- **Flux_Analysis**: The automatic variance-analysis feature that computes period-over-period changes and highlights the largest movers.
- **Chat_Interface**: The natural-language chat feature that answers user questions about the visible financial data.
- **Migration_Modal**: The static side-by-side comparison view showing legacy versus modern "DualEntry" rendering of the extracted data.
- **Demo_Site**: The self-contained HTML page simulating the Meridian Supply Co. ERP dashboard.
- **NIM_API**: The NVIDIA NIM OpenAI-compatible chat completions endpoint at `https://integrate.api.nvidia.com/v1/chat/completions` using model `meta/llama-3.1-70b-instruct`.
- **API_Key**: The user-supplied NVIDIA NIM Bearer token used to authenticate requests to the NIM_API.
- **Financial_Table**: An HTML table on the host page whose structure matches financial data (account/label rows with period columns of numeric currency values).
- **Financial_Dataset**: The structured JSON representation of an extracted Financial_Table, consisting of account rows and period columns.
- **Period**: A reporting column in the Financial_Dataset (for the demo, the quarters Q1 through Q4).
- **Variance_Card**: A UI element in Flux_Analysis that displays one account row's period-over-period change.
- **Session**: The lifetime of a single browser tab context from the time the Copilot_Overlay is activated until the tab is closed or reloaded.
- **Query_Quota**: The maximum number of Chat_Interface requests permitted per Session, fixed at 20.

## Requirements

### Requirement 1: Demo Site ERP Dashboard

**User Story:** As a recruiter, I want a public demo page that shows a realistic ERP dashboard, so that I can see Finance Copilot working without installing or configuring anything.

#### Acceptance Criteria

1. THE Demo_Site SHALL render a single self-contained HTML page that displays the text "Meridian Supply Co." as a visible page heading and presents the FY2024 financial data within a labeled Financial_Table arranged in a QuickBooks-style ERP dashboard layout.
2. THE Demo_Site SHALL display a Financial_Table containing at least the nine FY2024 accounts (Revenue, Cost of Goods Sold, Gross Profit, Marketing Expenses, Payroll, Software & Tools, Travel & Entertainment, Office & Facilities, Net Income) across four Periods (Q1, Q2, Q3, Q4).
3. THE Demo_Site SHALL display each FY2024 value for the nine specified accounts across the four Periods as United States dollar amounts formatted with a leading "$" symbol and comma thousands separators, matching the specified amounts exactly.
4. WHERE additional accounts beyond the nine specified accounts are included for realism, THE Demo_Site SHALL display each additional account across the same four Periods.
5. THE Demo_Site SHALL render using only a single HTML file and the Tailwind CSS CDN without requiring a build step.
6. THE Demo_Site SHALL include a Vercel configuration file that serves the HTML page as the site root.
7. IF the Tailwind CSS CDN does not load, THEN THE Demo_Site SHALL still display all nine specified accounts and their FY2024 values across the four Periods in the Financial_Table.

### Requirement 2: Financial Table Detection

**User Story:** As a user, I want the extension to recognize financial data tables on a page, so that the copilot can operate on relevant data automatically.

#### Acceptance Criteria

1. WHEN a webpage reaches its fully loaded document state, THE Content_Script SHALL scan the Document Object Model for HTML tables and SHALL complete that scan within 2 seconds of the load event.
2. WHERE a scanned table contains at least one label column (a column in which all data cells contain non-numeric text) and at least two columns of currency-formatted numeric values (columns in which all data cells display a value containing a currency symbol and/or one or more thousands separators, with optional decimal places), THE Content_Script SHALL classify the table as a Financial_Table.
3. WHEN at least one Financial_Table is detected, THE Content_Script SHALL enable user activation of the Copilot_Overlay for the active Financial_Table.
4. IF no Financial_Table is detected on the page, THEN THE Content_Script SHALL leave the host page unmodified and SHALL NOT inject the Copilot_Overlay.
5. WHEN the page is the Demo_Site, THE Content_Script SHALL detect the Meridian Supply Co. Financial_Table and activate the Copilot_Overlay automatically.
6. WHEN more than one Financial_Table is detected, THE Content_Script SHALL select as the active Financial_Table the detected table containing the greatest number of currency-formatted data cells, selecting the first such table in document order when two or more tables share that greatest number.

### Requirement 3: Financial Data Extraction and Serialization

**User Story:** As a developer, I want extracted table data represented as structured JSON, so that the AI features and migration view operate on consistent data.

#### Acceptance Criteria

1. WHEN the Copilot_Overlay is activated, THE Content_Script SHALL extract, from the detected Financial_Table, each account row label and one value per Period into a Financial_Dataset such that every account row contains exactly one value entry for each detected Period identifier.
2. THE Content_Script SHALL serialize the Financial_Dataset to JSON in which each account label is associated with its Period identifiers and, for each Period identifier, a single numeric value or null.
3. WHEN serializing a currency-formatted value, THE Content_Script SHALL convert the displayed string into a numeric value with currency symbols and thousands separators removed, treating parenthesized or minus-prefixed values as negative and preserving up to two decimal places.
4. FOR ALL extracted Financial_Datasets, serializing the dataset to JSON and then deserializing the JSON SHALL produce a dataset with account labels and Period identifiers exactly equal to the original, null values preserved as null, and numeric values within 0.01 of the original (round-trip property).
5. IF a cell value is empty or cannot be parsed as a number, THEN THE Content_Script SHALL record that cell as a null value in the Financial_Dataset.
6. IF the detected Financial_Table contains no extractable account rows or no Period columns, THEN THE Content_Script SHALL produce a Financial_Dataset containing zero account rows.

### Requirement 4: Copilot Overlay Injection

**User Story:** As a user, I want a floating copilot panel over the page, so that I can access the AI features without leaving my current dashboard.

#### Acceptance Criteria

1. WHEN the Copilot_Overlay is activated, THE Content_Script SHALL inject a floating panel rendered in the topmost stacking order so that the panel remains fully visible and is not obscured by any host page content, within 1 second of activation.
2. THE Copilot_Overlay SHALL provide user-accessible controls to open the Flux_Analysis, Chat_Interface, and Migration_Modal features.
3. IF the floating panel cannot be rendered in the topmost stacking order, THEN THE Copilot_Overlay SHALL keep the Flux_Analysis, Chat_Interface, and Migration_Modal features accessible.
4. WHEN the user requests to close the Copilot_Overlay, THE Copilot_Overlay SHALL hide the panel and restore the host page to its pre-injection visual state.
5. IF the close operation fails, THEN THE Copilot_Overlay SHALL keep the panel visible, SHALL retain the host page in its current visual state, and SHALL display an error message indicating that the overlay could not be closed.
6. THE Copilot_Overlay SHALL render its styles in isolation such that injected styles do not alter the visual appearance of host page elements and host page styles do not alter the visual appearance of the Copilot_Overlay.
7. IF the Copilot_Overlay is already injected WHEN activation is requested again, THEN THE Content_Script SHALL NOT inject an additional panel and SHALL keep the existing panel displayed.

### Requirement 5: API Key Management

**User Story:** As a user, I want to enter and persist my NVIDIA NIM API key, so that the chat feature can authenticate requests across browser sessions.

#### Acceptance Criteria

1. THE Popup SHALL provide an input field, bounded to 512 characters, for the user to enter the API_Key.
2. WHEN the user saves an API_Key containing at least one non-whitespace character, THE Popup SHALL store the API_Key with leading and trailing whitespace removed in `chrome.storage.local`.
3. WHEN the Popup successfully stores an API_Key, THE Popup SHALL display a save-success confirmation.
4. IF the user attempts to save an empty or whitespace-only API_Key, THEN THE Popup SHALL reject the save, SHALL retain any previously stored API_Key, and SHALL display a validation message indicating that the API_Key cannot be empty.
5. WHEN the Popup is opened and an API_Key is already stored, THE Popup SHALL indicate that an API_Key is configured without displaying the stored API_Key value.
6. WHEN the Popup is opened and no API_Key is stored, THE Popup SHALL indicate that no API_Key is configured.
7. WHEN the Background_Worker prepares a request to the NIM_API, THE Background_Worker SHALL retrieve the stored API_Key from `chrome.storage.local`.
8. IF no API_Key is stored WHEN the user submits a Chat_Interface query, THEN THE Chat_Interface SHALL reject the query and SHALL display a message directing the user to configure the API_Key in the Popup.
9. IF storing the API_Key to `chrome.storage.local` fails, THEN THE Popup SHALL retain the entered API_Key value in the input field and SHALL display an error indication.
10. IF the Background_Worker cannot retrieve an API_Key from `chrome.storage.local` WHEN preparing a request to the NIM_API, THEN THE Background_Worker SHALL NOT send the request and SHALL return an error to the Chat_Interface.

### Requirement 6: Flux Analysis

**User Story:** As a financial analyst, I want automatic variance analysis when the overlay opens, so that I can immediately see period-over-period changes and the largest movers.

#### Acceptance Criteria

1. WHEN the Copilot_Overlay is activated, THE Flux_Analysis SHALL compute, for each account row in the Financial_Dataset and without requiring user input, the period-over-period percentage change as the account row's most recent Period value minus its immediately preceding Period value, divided by its immediately preceding Period value, multiplied by 100.
2. THE Flux_Analysis SHALL render one Variance_Card per account row displaying the account label and the account row's period-over-period percentage change rounded to one decimal place with its sign, or a not-applicable indicator when the change is not-applicable.
3. THE Flux_Analysis SHALL flag as top movers the three account rows having the greatest absolute period-over-period percentage change among account rows whose change is applicable, ranked in descending order of absolute change with ties broken by ascending account row order in the Financial_Dataset, and SHALL flag all applicable account rows when fewer than three account rows have an applicable change.
4. WHERE an account row represents revenue or net income with a period-over-period percentage change greater than zero, THE Flux_Analysis SHALL render the corresponding Variance_Card in green.
5. WHERE an account row represents revenue or net income with a period-over-period percentage change less than zero, THE Flux_Analysis SHALL render the corresponding Variance_Card in red.
6. WHERE an account row represents an expense with a period-over-period percentage change greater than zero, THE Flux_Analysis SHALL render the corresponding Variance_Card in amber.
7. WHERE an account row represents an expense with a period-over-period percentage change less than zero, THE Flux_Analysis SHALL render the corresponding Variance_Card in green.
8. IF a prior-period value is zero or missing WHEN computing percentage change, THEN THE Flux_Analysis SHALL display the change as not-applicable for that account row.
9. WHERE an account row's period-over-period percentage change is exactly zero, is not-applicable, or the account row represents neither revenue, net income, nor an expense, THE Flux_Analysis SHALL render the corresponding Variance_Card in a neutral color.

### Requirement 7: AI Chat over Financial Data

**User Story:** As a user, I want to ask natural-language questions about the visible financial data, so that I can get explanations and insights without manual analysis.

#### Acceptance Criteria

1. THE Chat_Interface SHALL provide an input field, bounded to 1000 characters, for the user to enter a natural-language question.
2. WHEN the user submits a question containing at least one non-whitespace character, THE Chat_Interface SHALL send the question and the serialized Financial_Dataset to the Background_Worker.
3. WHEN the Background_Worker receives a question, THE Background_Worker SHALL send a chat completion request to the NIM_API using model `meta/llama-3.1-70b-instruct`, a maximum of 300 response tokens, and a temperature of 0.3.
4. WHEN the Background_Worker calls the NIM_API, THE Background_Worker SHALL include the stored API_Key as a Bearer token in the request authorization.
5. WHEN the NIM_API returns a response, THE Chat_Interface SHALL stream the response content into the Copilot_Overlay as it is received.
6. IF the NIM_API returns an error response, THEN THE Chat_Interface SHALL display an error indication and SHALL retain the entered question in the input field.
7. IF the user submits an empty or whitespace-only question, THEN THE Chat_Interface SHALL reject the submission, SHALL NOT send the question to the Background_Worker, and SHALL display a validation message.
8. IF the Background_Worker does not receive a response from the NIM_API within 30 seconds of sending the request, THEN THE Chat_Interface SHALL cancel the request, SHALL display an error indication, and SHALL retain the entered question in the input field.

### Requirement 8: Chat Rate Limiting

**User Story:** As the project owner, I want chat requests capped per session, so that demo usage of the API key remains bounded.

#### Acceptance Criteria

1. THE Chat_Interface SHALL allow a maximum of 20 accepted queries per Session, where an accepted query is one forwarded to the Background_Worker, as defined by the Query_Quota.
2. WHILE the count of submitted queries for the current Session is less than the Query_Quota, WHEN a Chat_Interface query is submitted, THE Chat_Interface SHALL increment the count of submitted queries for the current Session.
3. THE Chat_Interface SHALL display the number of remaining queries as the Query_Quota minus the current count of submitted queries, bounded to a minimum of zero.
4. IF the user submits a query WHEN the count of submitted queries for the current Session equals the Query_Quota, THEN THE Chat_Interface SHALL reject the query, SHALL NOT send the query to the Background_Worker, SHALL leave the count unchanged, and SHALL display a message indicating that the query quota has been reached.
5. IF the user submits a query WHILE the Session query count is uninitialized, THEN THE Chat_Interface SHALL reject the query, SHALL NOT send the query to the Background_Worker, and SHALL display a message indicating that queries are unavailable.
6. WHEN a new Session begins, THE Chat_Interface SHALL initialize the count of submitted queries to zero and SHALL set the number of remaining queries to the Query_Quota.

### Requirement 9: Simulate DualEntry Migration

**User Story:** As a recruiter, I want a one-click comparison of the legacy data versus a modern UI, so that I can see the migration concept demonstrated.

#### Acceptance Criteria

1. THE Migration_Modal SHALL provide a button in the Copilot_Overlay labeled to simulate migration to DualEntry.
2. WHILE no Financial_Dataset has been extracted, THE Migration_Modal SHALL keep the migration button disabled.
3. WHEN a Financial_Dataset has been extracted, THE Migration_Modal SHALL enable the migration button.
4. WHEN the user activates the migration button, THE Migration_Modal SHALL render, within 1 second, a side-by-side comparison view that displays all account rows and all Periods of the previously extracted Financial_Dataset.
5. WHILE the comparison view is displayed, THE Migration_Modal SHALL render the legacy representation using a desaturated and blurred visual style.
6. WHILE the comparison view is displayed, THE Migration_Modal SHALL render the modern DualEntry representation using a dark-themed visual style displaying the same account labels, Period identifiers, and numeric values as the legacy representation.
7. WHEN rendering the comparison, THE Migration_Modal SHALL use the previously extracted Financial_Dataset without calling the NIM_API.
8. IF rendering the comparison view fails after the migration button is activated, THEN THE Migration_Modal SHALL display an error message to the user and SHALL retain the previously extracted Financial_Dataset.
9. WHEN the user requests to close the Migration_Modal, THE Migration_Modal SHALL hide the comparison view and return focus to the Copilot_Overlay.
