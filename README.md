# Poyrax Finance - Budget Tracking App

Poyrax Finance is a simple budget tracking application built to help users manage their personal income and expenses. The app runs directly in the browser and stores data locally with LocalStorage, so it does not require a server or installation.

The project includes basic finance tracking features such as adding transactions, setting category budgets, viewing income and expenses, analyzing data with charts, and exporting records.

## Features

### Dashboard

The dashboard shows the user's current balance, total income, total expenses, and savings rate. It gives a quick overview of the user's financial situation in one place.

Charts are also included to make spending patterns and category distributions easier to understand.

### Transaction Management

Users can add, edit, and delete income or expense records. Each transaction can include a category, date, amount, and description.

Transactions can also be searched and filtered, making it easier to review past records.

### Budget Planning

Users can set monthly budget limits for different categories. Progress bars show how much of each budget has been used.

This feature is designed to help users keep their spending under control and follow their monthly plan more easily.

### Reports and Analysis

The app can analyze income and expenses by category. Users can review their spending habits through charts and summary sections.

Data can be exported in CSV or JSON format. This makes it possible to back up records or use them in other tools.

### Theme and Interface

The application includes both light and dark theme support. The interface is designed to work on different screen sizes.

It can be used on desktop, tablet, and mobile devices with a responsive layout.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Chart.js
- LocalStorage
- Font Awesome
- Google Fonts

## Installation

No server setup is required to run the project.

```bash
git clone https://github.com/poyraxx/Finance.git
cd Finance
```

After that, open the `index.html` file in your browser.

## Project Structure

```txt
poyrax-finance/
├── index.html
├── css/
│   ├── style.css
│   ├── themes.css
│   └── animations.css
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── charts.js
│   ├── budget.js
│   └── utils.js
└── README.md
```

## Project Notes

The main goal of this project is to create a clear and usable budget tracking system. Since the data is stored in the browser, the app can be used quickly without needing a backend.

Chart.js is used to display financial data in a more understandable way. The JavaScript files are separated by responsibility to keep the project structure cleaner.

## Browser Support

The app is intended to work on modern browsers such as:

- Chrome
- Firefox
- Safari
- Edge

## Possible Future Improvements

- Recurring transactions
- Bill reminders
- Saving goals
- Multiple account support
- PWA support
- Cloud synchronization

## Developer

**Erol Poyraz Çakmaz**

- GitHub: [@Poyraxx](https://github.com/Poyraxx)
- LinkedIn: [Erol Poyraz Çakmaz](https://www.linkedin.com/in/erol-poyraz-%C3%A7akmaz-a865a9387/)

## License

This project is licensed under the MIT License.
