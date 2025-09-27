import { ImageResponse } from "next/og";

async function loadAssets(): Promise<
  { name: string; data: Buffer; weight: 400 | 600; style: "normal" }[]
> {
  const [
    { base64Font: normal },
    { base64Font: mono },
    { base64Font: semibold },
  ] = await Promise.all([
    import("./geist-regular-otf.json").then((mod) => mod.default || mod),
    import("./geistmono-regular-otf.json").then((mod) => mod.default || mod),
    import("./geist-semibold-otf.json").then((mod) => mod.default || mod),
  ]);

  return [
    {
      name: "Geist",
      data: Buffer.from(normal, "base64"),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist Mono",
      data: Buffer.from(mono, "base64"),
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Geist",
      data: Buffer.from(semibold, "base64"),
      weight: 600 as const,
      style: "normal" as const,
    },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const description = searchParams.get("description");

  const [fonts] = await Promise.all([loadAssets()]);

  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full bg-black text-white"
        style={{ fontFamily: "Geist Sans" }}
      >
        <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 left-16 w-[1px]" />
        <div tw="flex border absolute border-stone-700 border-dashed inset-y-0 right-16 w-[1px]" />
        <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] top-16" />
        <div tw="flex border absolute border-stone-700 inset-x-0 h-[1px] bottom-16" />
        <div tw="flex absolute flex-row bottom-24 right-24 text-white">
          <svg
            width={48}
            height={48}
            viewBox="0 0 260 478"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className=""
              d="M130 216.896c-23.894 0-43.333-19.439-43.333-43.333S106.106 130.23 130 130.23s43.333 19.439 43.333 43.333-19.439 43.333-43.333 43.333zm0 173.794c23.894 0 43.333 19.439 43.333 43.333S153.894 477.356 130 477.356s-43.333-19.439-43.333-43.333S106.106 390.69 130 390.69zm86.667-304.023c-23.895 0-43.334-19.44-43.334-43.334C173.333 19.44 192.772 0 216.667 0 240.561 0 260 19.439 260 43.333c0 23.895-19.439 43.334-43.333 43.334zm0 173.792c23.894 0 43.333 19.439 43.333 43.334 0 23.894-19.439 43.333-43.333 43.333-23.895 0-43.334-19.439-43.334-43.333 0-23.895 19.439-43.334 43.334-43.334zM43.333 86.667C19.44 86.667 0 67.227 0 43.333 0 19.44 19.439 0 43.333 0c23.895 0 43.334 19.439 43.334 43.333 0 23.895-19.44 43.334-43.334 43.334zm0 173.792c23.895 0 43.334 19.439 43.334 43.334 0 23.894-19.44 43.333-43.334 43.333C19.44 347.126 0 327.687 0 303.793c0-23.895 19.439-43.334 43.333-43.334z"
              fill="white"
            />
          </svg>
        </div>
        <div tw="flex flex-col absolute w-[896px] justify-center inset-32">
          <div
            tw="tracking-tight flex-grow-1 flex flex-col justify-center leading-[1.1]"
            style={{
              textWrap: "balance",
              fontWeight: 600,
              fontSize: title && title.length > 20 ? 64 : 80,
              letterSpacing: "-0.04em",
            }}
          >
            {title}
          </div>
          <div
            tw="text-[40px] leading-[1.5] flex-grow-1 text-stone-400"
            style={{
              fontWeight: 500,
              textWrap: "balance",
            }}
          >
            {description}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 628,
      fonts,
    }
  );
}
