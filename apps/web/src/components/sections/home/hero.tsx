import Image from "next/image";
import PreviewDark from "@/assets/dark-preview.png";
import PreviewLight from "@/assets/preview.png";
import { WaitlistForm } from "./waitlist-form";
import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { AnimatedGroup } from "@/components/ui/animated-group";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function Hero() {
  prefetch(trpc.earlyAccess.getWaitlistCount.queryOptions());

  return (
    <div className="flex flex-col gap-12 md:gap-16 w-full max-w-6xl overflow-hidden">
      <AnimatedGroup variants={transitionVariants}>
        <div className="flex flex-col gap-12 px-4 md:px-6">
          <div className="flex flex-col gap-3 md:gap-6 items-center justify-center text-center">
            {/* <TextEffect
            preset="fade-in-blur"
            speedSegment={0.5}
            as="h1"
            className="text-4xl sm:text-5xl lg:text-6xl leading-tight font-satoshi"
          >
            Beyond Scheduling. A calendar that understands your life.
          </TextEffect> */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight font-satoshi">
              Beyond Scheduling. <br className="hidden sm:block" /> A calendar
              that understands your life.
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl">
              Analog is an open-source alternative that turns intentions into
              actions.
            </p>
          </div>

          <HydrateClient>
            <WaitlistForm />
          </HydrateClient>
        </div>
      </AnimatedGroup>

      <AnimatedGroup
        variants={{
          container: {
            visible: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.25,
              },
            },
          },
          ...transitionVariants,
        }}
      >
        <div className="min-w-[300vw] px-4 sm:px-6 w-full sm:max-w-7xl sm:min-w-0 sm:translate-x-0 mx-auto">
          <Image
            src={PreviewDark}
            alt="Hero"
            className="rounded-lg hidden dark:block"
            unoptimized
          />
          <Image
            src={PreviewLight}
            alt="Hero"
            className="rounded-lg block dark:hidden"
            unoptimized
          />
        </div>
      </AnimatedGroup>
    </div>
  );
}
