<div align="center" id="top">
  <h1>Cult Directory Template</h1>
  <p>A full stack nextjs 15.5 + shadcn@latest + tailwind v4 + supabase (new jwt auth) template</p>
</div>

<br/>

<div align="center">
  <img src="https://github.com/Jordan-Gilliam/readme-assets/blob/master/cult-dir-home.png" width="85%" alt="cult-dir-home" />
</div>

<br/>

### Table of contents

<nav>
  <ul style="list-style-type: none; padding: 15px; text-align: center; background-color: #282c34; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <li style="display: inline; margin-right: 20px; ">
      <a href="#getting-started" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Quick Start</a>
    </li>
    <li style="display: inline; margin-right: 20px;">
      <a href="#supabase" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Supabase Setup</a>
    </li>
    <li style="display: inline; margin-right: 20px;">
      <a href="#develop" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Develop</a>
    </li>
    <li style="display: inline; margin-right: 20px;">
      <a href="#adding-products-to-the-directory" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Adding Products to the Directory</a>
    </li>
    <li style="display: inline; margin-right: 20px;">
      <a href="#customizing-labels-and-tags" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Customize Labels & Tags</a>
    </li>
    <li style="display: inline; margin-right: 20px;">
      <a href="#admin-setup" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Admin Setup</a>
    </li>
    <li style="display: inline; margin-right: 20px;">
      <a href="#accessing-the-admin-dashboard" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Accessing the Admin Dashboard</a>
    </li>
    <li style="display: inline; margin-right: 20px;">
      <a href="#customize" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Customize</a>
    </li>
    <li style="display: inline; margin-right: 20px;">
      <a href="#deploy" style="text-decoration: none; color: #61dafb; font-weight: bold; font-size: 16px; transition: color 0.3s;">Deploy</a>
    </li>
  </ul>
</nav>

<div id="getting-started">
  
# Quick Start (new)
> Follow the checklist by running your dev server and navigating to http://localhost:3000
### Install Dependencies

```bash
  pnpm i
```

### Start Dev Server and follow the in app tutorial

```bash
pnpm run dev
```

open `http://localhost:3000` in your browser

**✨ New Feature:** The first user to sign up is automatically promoted to admin - no manual setup required!

</div>

# Long Start

<div id="supabase" >

## Supabase

### Install the Supabase CLI

- **Mac:** `brew install supabase/tap/supabase`
- **Windows:**

  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

- **Linux:** `brew install supabase/tap/supabase`
- **NPM/Bun:** `npx supabase <command>`

<br/>

### Create a Supabase project

1. Create a Supabase project at [Supabase Dashboard](https://database.new), or via the CLI:

   ```shell
   npx supabase projects create -i "your-saas-app"
   ```

   Your Org ID can be found in the URL after [selecting an org](https://supabase.com/dashboard/org/_/general).

<br/>

### Link your CLI to the project

2. Link your CLI to the project:

   ```shell
   npx supabase init
   npx supabase link
   ```

   Select the project you just created.

<br/>

### Store Supabase URL & public anon key in `.env.local` for Next.js

#### [Watch this video to setup the new (faster) jwt tokens:](https://youtu.be/rwnOal_xRtM?si=c8lAHEF1mr99CP1h)

3. Store Supabase URL & public anon key in `.env.local` for Next.js:

   ```shell
   NEXT_PUBLIC_SUPABASE_URL=<api-url>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<anon-key>
   SUPABASE_SECRET_KEY="sb_secret_xxxxxxxxxxx-xxxxxxxxxxx"
   ```

   You can get the project API URL and anonymous key from the [API settings page](https://supabase.com/dashboard/project/_/settings/api-keys/new).

<br/>

### Setup DB schema

4. Setup DB schema:

   > This will run all of the migrations located in the `supabase/migrations` directory, including the auto-admin promotion feature

   ```shell
   supabase db push
   ```

## Ensure your `.env` variables are configured correctly

```bash
cp .env.example .env.local

```

[API JWT SIGNING KEYS](https://supabase.com/dashboard/project/_/settings/jwt/signing-keys)
[API PUBLISHABLE & SECRET](https://supabase.com/dashboard/project/_/settings/api-keys/new)

```bash
# Example Supabase Config
NEXT_PUBLIC_SUPABASE_URL="https://examplesqnwerasdfaser.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.."
SUPABASE_SECRET_KEY="sb_secret_xxxxxxxxxxx-xxxxxxxxxxx"
```

</div>

## Develop

<div id="develop" >

### Install dependencies and run the Next.js client

In a separate terminal, run the following commands:

```shell
pnpm i
```

> **Note:** The `pnpm i` command will automatically install Chrome for the web scraping functionality. This is required for the seed scripts to work properly.

```shell
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000/) in your browser.

## Adding Products to the Directory

To add new products to your directory, simply visit the submission page:

[Submit Products](http://localhost:3000/submit-new)

</div>

### Congratulations!

You now have a fully seeded database with all the data you need to start building your own cult directory.

## 🏷️ Customizing Labels and Tags for Your Directory

<div id="customizing-labels-and-tags">

The Cult Directory template comes pre-configured for a tech/design directory, but you can easily customize it for any niche or industry. This section explains how to modify the categorization system to match your specific needs.

### Understanding the Current Schema

The directory uses a three-tier categorization system:

1. **Categories** (broad): `dev`, `design`, `learning`, `media`
2. **Labels** (medium): More specific groupings within each category
3. **Tags** (specific): Individual items, tools, or concepts

### Current Tech/Design Configuration

```typescript
// Categories
;["dev", "design", "learning", "media"]

// Labels by Category
dev: [
  "frontend-frameworks",
  "backend-frameworks",
  "component-libraries",
  "developer-tools",
  "apis-services",
]
design: [
  "design-systems",
  "typography",
  "icons-graphics",
  "design-tools",
  "visual-assets",
  "color-tools",
]
learning: ["tutorials", "documentation", "courses", "articles", "examples"]
media: ["stock-media", "editing-tools", "generators"][
  // Tags (examples)
  ("react",
  "vue",
  "fonts",
  "web-fonts",
  "figma-plugins",
  "color-tools",
  "stock-photos")
]
```

### Customizing for Different Industries

#### Example 1: Food & Restaurant Directory

```typescript
// Categories
["restaurants", "food-delivery", "cooking", "ingredients"]

// Labels by Category
restaurants: ["fine-dining", "casual-dining", "fast-food", "food-trucks", "cafes"]
food-delivery: ["meal-kits", "grocery-delivery", "restaurant-delivery", "catering"]
cooking: ["recipes", "cooking-tools", "techniques", "meal-planning"]
ingredients: ["produce", "meat-seafood", "dairy", "pantry", "spices"]

// Tags
["italian", "vegan", "gluten-free", "meal-prep", "slow-cooker", "organic"]
```

#### Example 2: Fitness & Wellness Directory

```typescript
// Categories
;["fitness", "nutrition", "wellness", "equipment"]

// Labels by Category
fitness: ["strength-training", "cardio", "yoga", "pilates", "sports"]
nutrition: ["supplements", "meal-plans", "diet-plans", "superfoods"]
wellness: ["mental-health", "sleep", "recovery", "mindfulness"]
equipment: ["home-gym", "wearables", "accessories", "apparel"][
  // Tags
  ("protein", "meditation", "hiit", "flexibility", "tracking", "recovery")
]
```

#### Example 3: Travel & Tourism Directory

```typescript
// Categories
;["destinations", "accommodations", "activities", "planning"]

// Labels by Category
destinations: ["beaches", "mountains", "cities", "countryside", "islands"]
accommodations: ["hotels", "vacation-rentals", "hostels", "resorts", "camping"]
activities: ["adventure", "culture", "food-tours", "wellness", "family"]
planning: ["booking-platforms", "travel-insurance", "guides", "transportation"][
  // Tags
  ("budget-travel", "luxury", "family-friendly", "solo-travel", "eco-tourism")
]
```

### How to Modify the Schema

#### Step 1: Update the Prompt Configuration

Edit `supabase/seed/src/stage-2-enrich/prompt.ts`:

```typescript
// Update categories
export const categoriesEnum = ["your", "new", "categories"] as const

// Update labels
export const labelsEnum = {
  your: ["label1", "label2"] as const,
  new: ["label3", "label4"] as const,
  categories: ["label5", "label6"] as const,
}

// Update tags
export const tagsEnum = [
  "tag1",
  "tag2",
  "tag3",
  // ... your specific tags
] as const
```

#### Step 2: Update the Classification Rules

Modify the classification rules in the prompts to match your industry:

```typescript
## Classification Rules

YOUR_INDUSTRY_SPECIFIC_RULES:
- If site provides X, use labels: ["relevant-label"]
- If site offers Y, use tags: ["relevant-tag1", "relevant-tag2"]

// Example for Food Directory:
RESTAURANTS:
- If site is a restaurant or food service
- Labels: ["restaurants"]
- Tags: ["cuisine-type", "dining-style"]
```

#### Step 3: Update Examples

Replace the tech examples with industry-specific ones:

```typescript
Example 1 - Restaurant:
- Input
  Site Name: "Pizza Palace"
  Site Description: "Authentic Italian pizza restaurant"
- Output
  {
    "category": "restaurants",
    "labels": ["casual-dining"],
    "tags": ["italian", "pizza"]
  }
```

#### Step 4: Update the Database Schema (Optional)

If you want to change the database structure, you'll need to create new migrations:

```sql
-- Example: Add new category column or modify existing ones
ALTER TABLE products ADD COLUMN industry_category TEXT;
```

### Best Practices for Customization

1. **Start Simple**: Begin with 3-5 categories and 2-4 labels per category
2. **Be Specific**: Avoid overly broad terms that could apply to everything
3. **Test Examples**: Create realistic examples for your AI enrichment prompts
4. **Iterate**: Start with basic categorization and refine based on results
5. **Consistency**: Use consistent naming conventions (kebab-case recommended)

### Testing Your Custom Schema

After updating the schema:

1. **Test with Sample Data**: Use the enrichment scripts with a few test URLs
2. **Review Results**: Check that items are being categorized correctly
3. **Refine**: Adjust labels and tags based on actual results
4. **Scale**: Once satisfied, run the full enrichment process

### Need Help?

- Check the existing examples in `supabase/seed/src/stage-2-enrich/prompt.ts`
- Review the AI enrichment documentation in `supabase/seed/src/stage-2-enrich/readme.md`
- Test your changes with small datasets before running full enrichment

 <div id="admin-setup">
   
# Admin Setup

<div align="center">
  
  <img src="https://github.com/Jordan-Gilliam/readme-assets/blob/master/cult-dir-pro-admin-filters.png" alt="cult-dir-pro-admin-filters" width="90%" />
  
</div>
<div align="center">
  
  <img src="https://github.com/Jordan-Gilliam/readme-assets/blob/master/cult-dir-pro-admin-products-2.png" alt="cult-dir-pro-admin-products-2" width="90%" />
  
</div>

<div align="center">
  <img src="https://github.com/Jordan-Gilliam/readme-assets/blob/master/cult-dir-pro-admin-analytics.png" alt="cult-dir-pro-admin-analytics" width="90%" />
</div>

### 🎉 **Auto-Admin Promotion (NEW!)**

The first user to sign up for your directory is **automatically promoted to admin**! This eliminates the need for manual SQL queries during setup.

**How it works:**

- When the first user registers, they automatically receive admin privileges
- All subsequent users will be regular users by default
- No manual intervention required - just sign up and you're ready to go!

### Sign up with the email you want for your admin account

#### Recommended: Turn off confirm email

> The default smtp rate limiting for supabase is very low now.

- The rate was lowered to 4/hour for the built in SMTP service.
- Too low for production. You need to use your own SMTP service.

Providers Email - [API settings page](https://supabase.com/dashboard/project/_/auth/providers).

<div align="center">
  <img src="https://github.com/Jordan-Gilliam/readme-assets/blob/master/supabase-auth-email-switch.png" alt="supabase-auth-email-switch" width="90%" />
</div>

If you need email confirmation follow follow these guides

- [How to Increase Supabase signup rate limit (3000 free emails / mo)](https://medium.com/@techalchimiste/how-to-increase-supabase-signup-rate-limit-3000-emails-mo-261289882cf4)
- [How to configure Supabase to send emails from your domain](https://resend.com/blog/how-to-configure-supabase-to-send-emails-from-your-domain)

[Sign up here](http://localhost:3000/sign-up) to create your admin account!

### Manual Admin Assignment (Optional)

If you need to manually assign admin rights to additional users, you can still do so:

1. **Copy the user's UID**

<div align="center">
  <img src="https://github.com/Jordan-Gilliam/readme-assets/blob/master/supabase-admin-user-uid.png" alt="supabase-admin-user-uid" width="90%" />
</div>

Retrieve from the auth users table [API settings page](https://supabase.com/dashboard/project/_/auth/users).

2. **Assign Admin Rights**

Go to the SQL Editor in Supabase [API settings page](https://supabase.com/dashboard/project/_/sql/new).

```sql
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
    coalesce(raw_app_meta_data, '{}'),
    '{claims_admin}',
    'true'::jsonb
)
WHERE id = 'USER_UUID';
```

Replace `'USER_UUID'` with the user ID you copied from the auth users table.

### 3-Stage AI Bulk Enrichment Scripts

> The seed script is pretty complex. There are overview docs 0. `supabase/seed/src/README.md`
> And docs for each stage:

1. `supabase/seed/src/stage-1-crawl/readme.md`
2. `supabase/seed/src/stage-2-enrich/readme.md`
3. `supabase/seed/src/stage-3-seed/readme.md`

I've tried to make it as cheap as possible to run. Depending on your API support level you can increase the performance of the scripts by playing with the concurrency and timeout values.

You need either the `ANTHROPIC_API_KEY` or an `ANTHROPIC_API_KEY` in your `.env.local` file to run `supabase/seed/src/stage-2-enrich`.

1. If you have an API key, copy it to your `.env.local` file.
2. Optionally edit the `SEED_URLS` variable in `supabase/seed/src/main.ts` to include the URLs you want to scrape and enrich.
3. Run the script:

   ```shell
   pnpm run enrich-seed
   ```

> **Note:** The seed script now automatically detects the admin user from the database - no need to set `SUPABASE_ADMIN_ID`!

> **Browser Requirement:** The crawler needs Chrome to scrape websites. Chrome is automatically installed when you run `pnpm install`, but if you encounter browser issues, run `pnpm run install-browser`.

</div>

## Accessing the Admin Dashboard

<div id="accessing-the-admin-dashboard" >

Manage the content and users of your directory through the admin dashboard. Access it here:

[Admin Dashboard](http://localhost:3000/admin)

</div>

## Customize

<div id="customize" />

### Custom Color Theme

To give your directory a unique look, create a custom color theme:

1. **Design Your Theme**

   Visit the [custom shadcn theme](https://www.cult-ui.com/themes) page to design your theme.

2. **Apply Your Theme**

   Once you have your theme, copy the relevant CSS and paste it into your `app/globals.css` file, replacing lines 5-67.

## Deploy

<div id="deploy">

1. **Create a new repository and push the project to GitHub.**

2. **Go to Vercel and import the GitHub repository: [Deploy](https://vercel.com/new).**

3. **Set up Environment Variables in Vercel**

   Go to your project settings on Vercel and set up the environment variables by copying the content from your `.env.local` file. Ensure the following variables are included:

   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase API URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_PROJECT_ID` - Your Supabase project ID

   - `OPENAI_API_KEY` - OpenAI API KEY
     ## OR
   - `ANTHROPIC_API_KEY` - Anthropic API KEY

- Any other environment variables specific to your project setup

> **Note:** `SUPABASE_ADMIN_ID` is no longer required as the first user is automatically promoted to admin!

Here's an example of what your environment variables might look like:

```plaintext
NEXT_PUBLIC_SUPABASE_URL="https://abcd1234.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_PROJECT_ID="abcd1234"
OPENAI_API_KEY` - OpenAI API KEY
## OR
ANTHROPIC_API_KEY` - Anthropic API KEY
```

4. **Deploy the Project**

   Once your environment variables are set, you can deploy your project. Vercel will handle the build and deployment process for you.

5. **Access Your Live Application**

   After deployment, you can access your live application through the URL provided by Vercel. Your application should now be live and ready to use.

</div>

## Conclusion

Welcome to the cult! :)

Follow the steps outlined in this README to deploy and customize your directory app. If you have any questions or run into issues, feel free to reach out for support on Twitter: [https://x.com/nolansym](https://x.com/nolansym)

Cheers! Stoked to see what you build!

<a href="#top" style="text-decoration: none; color: #007bff; font-weight: bold;">Scroll to top</a>
