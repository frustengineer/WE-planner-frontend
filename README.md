# Wild Excursions web app

Next.js 16 and React 19 frontend demo for the jungle safari planner. Park
catalogue, sample availability, and example prices are local frontend data.
The booking flow does not check real permits or send enquiries.

## Run locally

```bash
npm install
npm run dev
```

Availability is generated deterministically in the browser to make the planner
interactive. Enquiry confirmation is stored only in the current browser session.
