import { crawlAndSave } from "./stage-1-crawl"
import { enrichLatestData } from "./stage-2-enrich"
import { seedDatabase } from "./stage-3-seed"

const SEED_URLS = [
  // "https://cult-ui.com",
  // "https://ui.shadcn.com",
  // "https://uipub.com",
  // "https://tweakcn.com",
  // "https://originui.com",
  // "https://ui.aceternity.com",
  // "https://shadcnui-blocks.com",
  // "https://shadcnblocks.com",
  // "https://www.styleglide.ai",
  // "https://neobrutalism.dev",
  // "https://kokonutui.com",
  // "https://magicui.design",

  // "https://kibo-ui.com",
  // "https://reui.io",
  // "https://retroui.dev",

  "https://pro.cult-ui.com",
  "https://cleanmyseo.com",

  "https://github.com/kennetpostigo/react-google-login-component",
  "https://www.curated.design/?category=assets",
  "https://developers.google.com/analytics/devguides/collection/analyticsjs/",
  "https://css-tricks.com/firebase-react-part-2-user-authentication/",
  "https://blog.daftcode.pl/bugs-in-production-the-dirty-dozen-107afe278b94",
  "https://klim.co.nz/retail-fonts/family/",
  "https://builder.io/content/f9b2e832b40246018ede59f16fbabb19/edit",
  "https://buttons.ibelick.com/",
  "https://www.nutsdev.com/?ref=unsection.com",
  "https://onepagelove.com/",
  "https://www.joshwcomeau.com/css/interactive-guide-to-grid/",
  "https://www.collletttivo.it/typefaces/mazius-display",
  "https://www.magicpattern.design/",
  "https://velvetyne.fr/fonts/le-murmure/",
  "https://velvetyne.fr/fonts/anthony/",
  "https://velvetyne.fr/fonts/gulax/",
  "https://velvetyne.fr/fonts/karrik/",
  "https://fonts.google.com/specimen/Syne?query=syne&preview.text=cult%20%2F%20ui",
  "https://velvetyne.fr/fonts/jgs-font/",
  "https://velvetyne.fr/fonts/trickster/",
  "https://freesets.vercel.app/icons",
  "https://velvetyne.fr/fonts/avara/",
  "https://avvvatars.com/",
  "https://vercel.com/blog/building-a-fast-animated-image-gallery-with-next-js",
  "https://uiverse.io/",
  "https://hypercolor.dev/",
  "https://cleanmyseo.com",
  "https://babeljs.io/repl/",
  "https://thebookofshaders.com/02/",
  "https://egghead.io/courses/getting-started-with-redux",
  "https://css-tricks.com/intro-firebase-react/",
  "https://svgdoodles.com/",
  "https://github.com/gitname/react-gh-pages",
  "https://www.collletttivo.it/typefaces/mazius-display/",
  "https://www.tunera.xyz/",
  "https://www.curated.design/",
  "https://gist.github.com/mackenziechild/035fc7c96d648b4eada1f5d9ba4eb2dc",
  "https://github.com/vuejs/vue",
  "https://github.com/youzan/vant",
  "https://github.com/thedaviddias/Front-End-Checklist",
  "https://designresourc.es/",
  "https://blog.bitsrc.io/8-react-application-deployment-and-hosting-options-for-2019-ab4d668309fd",
  "https://fonts.google.com/specimen/Space+Grotesk",
  "https://www.futurefonts.xyz/jtd/oculi",
  "https://uiverse.io/patterns",
  "https://www.futurefonts.xyz/slobzheninov/relaate",
  "https://fonts.google.com/specimen/Archivo",
  "https://fonts.google.com/specimen/Public+Sans",
  "https://fonts.google.com/specimen/Work+Sans",
  "https://www.futurefonts.xyz/fonts?sort=random&page=1&limit=24&license_type=web",
  "https://www.futurefonts.xyz/ryan-bugden/meekdisplay",
  "https://www.futurefonts.xyz/teo-tuominen/ra",
  "https://www.futurefonts.xyz/duong-tran/lavishe",
  "https://www.futurefonts.xyz/studiotriple/digestive",
  "https://www.futurefonts.xyz/phantom-foundry/phantom-sans",
  "https://velvetyne.fr/fonts/sligoil/",
  "https://www.builtatlightspeed.com/",
  "https://framermotionexamples.com/",
  "https://velvetyne.fr/fonts/backout/",
  "https://web3templates.notion.site/Tailwind-CSS-Snippets-4131be7486574f2c9fe0f2e3714bb9d8",
  "https://www.uilabs.dev/",
  "https://buildui.com/",
  "https://type-department.com/collections/sans-serif-fonts/products/rotonto/",
  "https://velvetyne.fr/fonts/terminal-grotesque/",
  "https://variantvault.chrisabdo.dev/",
  "https://platejs.org/?builder=true",
  "https://neobrutalism-components.vercel.app/shadcn/components/button",
  "https://shadcn-extension.vercel.app/docs/carousel",
  "https://www.grillitype.com/typeface/gt-walsheim",
  "https://www.fontshare.com/",
  "https://uncut.wtf/",
  "https://maximalexpression.notion.site/SHADER-PROTOTYPING-146da33982c54746a0589ebcbdbf717a",
  "https://www.advancedframer.com/",
  "https://www.theleagueofmoveabletype.com/",
  "https://shapes.framer.website/",
  "https://velvetyne.fr/",
  "https://shape.so/browse",
  "https://www.shadergradient.co/",
  "https://openverse.org/",
  "https://supply.family/shop/dune-30-gradient-backgrounds/",
  "https://supply.family/shop/squeezer-1-36-abstract-backgrounds/",
  "https://fonts.google.com/specimen/Crimson+Text",
  "https://supply.family/shop/gradient-blend-noise-1/",
  "https://danielsun.space/",
  "https://www.nutsdev.com/",
  "https://fontsfree.pro/base-web-fonts/sans-serif-grotesque/231-aktiv-grotesk-corp.html",
  "https://www.atipofoundry.com/fonts/brockmann",
  "https://components.bridger.to/",
  "https://csspro.com/",
  "https://www.myfonts.com/collections/pf-din-text-pro-font-parachute",
]

// Improved logging utility for main pipeline
class PipelineLogger {
  private startTime: number
  private currentStep: string = ""
  private stepStartTime: number = 0

  constructor() {
    this.startTime = Date.now()
  }

  startStep(stepName: string, stepNumber: number) {
    this.currentStep = stepName
    this.stepStartTime = Date.now()
    console.log(`\n${stepNumber}. 🚀 ${stepName}`)
    console.log("─".repeat(stepName.length + 5))
  }

  getStartTime(): number {
    return this.startTime
  }

  endStep() {
    const duration = Date.now() - this.stepStartTime
    console.log(`✅ ${this.currentStep} completed in ${duration}ms`)
  }

  info(message: string) {
    console.log(`ℹ️  ${message}`)
  }

  success(message: string) {
    console.log(`✅ ${message}`)
  }

  error(message: string) {
    console.log(`❌ ${message}`)
  }

  summary(duration: number) {
    console.log("\n" + "=".repeat(60))
    console.log("🎉 PIPELINE COMPLETED SUCCESSFULLY")
    console.log("=".repeat(60))
    console.log(`⏱️  Total Duration: ${duration}ms`)
    console.log(`📊 All stages completed successfully`)
    console.log("=".repeat(60))
  }
}

const logger = new PipelineLogger()

const main = async () => {
  console.log("🌱 CULT DIRECTORY SEEDING PIPELINE")
  console.log("=".repeat(60))
  logger.info("Starting the pipeline...")

  try {
    logger.startStep("Crawl and save raw data", 1)
    await crawlAndSave(SEED_URLS)
    logger.endStep()

    logger.startStep("Enrich the latest raw data", 2)
    await enrichLatestData()
    logger.endStep()

    logger.startStep("Seed the database with the enriched data", 3)
    await seedDatabase()
    logger.endStep()

    const totalDuration = Date.now() - logger.getStartTime()
    logger.summary(totalDuration)
  } catch (error) {
    logger.error(
      `Pipeline failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )

    // Provide helpful guidance for common errors
    if (error instanceof Error) {
      if (
        error.message.includes("Could not find Chrome") ||
        error.message.includes("Failed to launch browser")
      ) {
        console.log("\n🔧 Browser Installation Issue Detected!")
        console.log("The crawler needs Chrome to be installed. Try running:")
        console.log("  pnpm run install-browser")
        console.log("Or if that doesn't work:")
        console.log("  npx puppeteer browsers install chrome")
        console.log("\nAfter installing, run the seed script again:")
        console.log("  pnpm run enrich-seed")
      }
    }

    process.exit(1)
  }
}

main()
