# USERFLOW.md: EcoFlow AI

This document outlines the primary user journeys within the EcoFlow AI platform, focusing on the most critical and unique interactions that leverage the platform's core AI capabilities for eco-enzyme optimization.

## 1. Initial Fermentation Setup (Smart Eco-Enzyme Roadmap)

This flow describes how a user initiates a new eco-enzyme fermentation batch, utilizing the AI to calculate ideal ingredient ratios.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | User | Navigates to "Start New Fermentation" section. | Displays input form for organic waste details. | |
| 2 | User | Enters organic waste weight (e.g., "1.5 kg") and selects waste type (e.g., "Mixed Fruit Peels"). | System validates input format. | Invalid input: Error message "Please enter a valid number for waste weight." |
| 3 | User | Clicks "Calculate Ratios". | System calculates ideal water and sugar quantities based on `Water (L) = Waste (kg) × 3` and `Sugar (kg) = Waste (kg) × 1`. Displays calculated values (e.g., "4.5 L Water, 1.5 kg Sugar") and an ingredient checklist. | |
| 4 | User | (Optional) Manually adjusts water or sugar quantities. | System re-calculates the ratio via `POST /api/v1/check-ingredient-ratio` and displays a warning if deviation >10% from ideal (e.g., "Warning: Ratio deviates significantly from optimal. This may affect fermentation success."). | User ignores warning and proceeds. |
| 5 | User | Confirms ingredients and clicks "Create Batch". | System creates a new fermentation batch record, stores initial parameters, and displays the batch on the user's dashboard with a "Pending Start" status. | System error: "Failed to create batch. Please try again." (Logs error for admin review). |

**Trigger:** User decides to start a new eco-enzyme fermentation.
**Pre-conditions:** User is logged into the EcoFlow AI platform.
**Post-conditions:** A new fermentation batch is created in the system with initial ingredient calculations, and the user is presented with a checklist for preparation.

## 2. Fermentation Monitoring & Correction (AI Fermentation Assistant)

This flow details how users log the progress of an active fermentation batch and receive AI-driven feedback and corrective actions.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | User | Selects an active fermentation batch from their dashboard. | Displays the batch details, including previous logs and a form for new log entries. | |
| 2 | User | Enters daily/weekly log parameters: aroma (dropdown), color (hex picker/preset), gas presence (yes/no), temperature (°C). | System validates input. | Invalid input: Error message "Please ensure all fields are correctly filled." |
| 3 | User | (Optional) Uploads an image of the fermentation liquid. | System processes image (e.g., for color analysis, visual anomalies). | Image upload fails: "Image upload failed. Please try again." (Log entry proceeds without image). |
| 4 | User | Clicks "Submit Log". | System records the log entry, updates the batch's history, and triggers the AI Fermentation Assistant. AI analyzes current and historical logs. | |
| 5 | System | Based on AI analysis, classifies fermentation status (Normal/Caution/Failed) and generates a health score (0-100). | Displays updated status, health score, and proactive corrective instructions if status is "Caution" or "Failed" (e.g., "Caution: pH may be too high. Add 50g sugar and stir gently."). | No issues detected: "Fermentation proceeding normally." |
| 6 | System | If fermentation is near optimal completion (e.g., day 90±7), triggers a "Harvest Readiness" alert. | Displays a prominent notification on the dashboard and within the batch details. | |

**Trigger:** User wants to update the status of an ongoing eco-enzyme fermentation.
**Pre-conditions:** User is logged in and has at least one active fermentation batch.
**Post-conditions:** The fermentation batch log is updated, the AI provides a status and recommendations, and the user is informed of the batch's health and potential harvest readiness.

## 3. Post-Harvest Product Recommendation & Adaptive Roadmap

This flow covers the core "post-eco-enzyme optimization" where the AI recommends derivative products and generates step-by-step processing guides.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | User | Selects a "Harvest Ready" or "Harvested" fermentation batch. | Displays a form to confirm harvest and input final liquid characteristics. | |
| 2 | User | Confirms harvest, enters final liquid volume (L), color (preset), and aroma intensity (`sweet`/`sour`). | System validates input. | Invalid input: "Please provide all required harvest details." |
| 3 | User | Clicks "Get Product Recommendations". | System triggers the AI Product Recommendation engine. AI matches characteristics against product templates (from DB, 8 products) and ranks recommendations by compatibility score (color 40% + aroma 40% + volume 20%, intent bonus 1.2x). | |
| 4 | System | Displays a list of recommended derivative products (e.g., "Liquid Fertilizer (92%)", "Household Cleaner (88%)") with brief descriptions. | | No suitable recommendations: "No strong product matches found. Consider general use or re-fermentation." |
| 5 | User | Selects a preferred product from the list (e.g., "Liquid Fertilizer"). | System persists selection via `POST /api/v1/batches/{batch_id}/select-product` and prompts for roadmap generation. | User requests alternative recommendations: System re-ranks or suggests broader categories. |
| 6 | User | Clicks "Generate Adaptive Roadmap". | System generates a step-by-step processing guide for the **selected** product (not a default), including ingredients, equipment, time estimates, and safety warnings. Provides options to download as PDF. | System error: "Failed to generate roadmap. Please try again." |
| 7 | User | (Optional) Marks milestones as complete within the roadmap. | System updates progress for the specific product roadmap. | |

**Trigger:** User has successfully harvested an eco-enzyme batch and wants to determine its best use.
**Pre-conditions:** User is logged in, and a fermentation batch has been marked as harvested.
**Post-conditions:** The user receives AI-driven product recommendations, selects a product, and is provided with a detailed, adaptive roadmap for processing it.

## 4. Business Analysis for UMKM Operators

This flow enables UMKM Operators to perform financial feasibility analysis for their eco-enzyme derivative products.

| No | Actor | Action/Step | System Response | Alternative/Alternative Path/Error Path |
|:---|:---|:---|:---|:---|
| 1 | UMKM Operator | Navigates to the "Business Analysis" section for a selected product derivative. | Displays an input form for commercial details. | |
| 2 | UMKM Operator | Enters commercial inputs: estimated production volume (L), target market, packaging type, distribution channel, and any additional costs. | System validates input. | Invalid input: "Please fill in all required commercial details." |
| 3 | UMKM Operator | Clicks "Run Analysis". | System triggers the Business Analysis engine. It calculates COGS, suggested retail price (SRP), gross margin, and break-even units. | |
| 4 | System | Displays a summary of financial calculations, including a 12-month profit projection and a feasibility rating (Viable/Marginal/Not Viable). | | |
| 5 | UMKM Operator | (Optional) Adjusts input parameters (e.g., target price, production volume) and re-runs analysis. | System recalculates and updates the financial summary. | |
| 6 | UMKM Operator | Clicks "Generate Report". | System compiles a comprehensive business viability report (PDF) with all calculations, projections, and the feasibility rating. | System error: "Failed to generate report. Please try again." |

**Trigger:** An UMKM Operator wants to assess the commercial viability of an eco-enzyme derivative product.
**Pre-conditions:** User is logged in as an UMKM Operator and has a product derivative selected from a harvested batch.
**Post-conditions:** The UMKM Operator receives a detailed financial analysis and a business viability report for their chosen product.