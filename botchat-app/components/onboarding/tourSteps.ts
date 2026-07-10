/**
 * Tour steps derived from actual dashboard routes, sidebar navigation, and UI elements.
 * Each step targets a real DOM element via `target` (CSS selector or data-tour-id).
 * Order: most-important features first.
 */

export type TourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface TourStep {
    id: string;
    title: string;
    description: string;
    target: string; // CSS selector
    placement: TourPlacement;
    route?: string; // navigate to this route before showing step (optional)
    scrollToTarget?: boolean;
    mediaUrl?: string; // Optional engaging illustration / video thumbnail
    youtubeId?: string; // Optional YouTube ID for interactive tutorial
}

const tourSteps: TourStep[] = [
    {
        id: "welcome",
        title: "Welcome to BotChat! 👋",
        description: "This quick tour will show you how to use BotChat to automate your messages and save hours of time. \n\nClick 'Next' to explore the most important features.",
        target: "[data-tour='dashboard-header']",
        placement: "bottom",
        route: "/dashboard",
        youtubeId: "LXb3eKWsInQ"
    },
    {
        id: "elite-flows",
        title: "Your Automations",
        description: "This is your Automations table. It shows how many people are interacting with your chatbots right now, and how successful those chats are.",
        target: "[data-tour='elite-flows']",
        placement: "top",
        scrollToTarget: true,
    },
    {
        id: "nav-facebook",
        title: "Facebook Automation",
        description: "Let's leave the dashboard for a second. We'll start by setting up your Facebook bots. Click Next to go there.",
        target: "[data-tour='sidebar-facebook']",
        placement: "right",
        scrollToTarget: false,
    },
    {
        id: "page-facebook",
        title: "Connect Your Facebook",
        description: "Here you can connect your Facebook account. Once connected, your AI will automatically reply to comments on your posts and answer DMs instantly.",
        target: "header",
        placement: "bottom",
        route: "/dashboard/facebook",
        scrollToTarget: false,
        youtubeId: "Y8Z20b_zhyo"
    },
    {
        id: "nav-instagram",
        title: "Instagram Tools",
        description: "Now let's check out Instagram. We can also automate your Instagram presence.",
        target: "[data-tour='sidebar-instagram']",
        placement: "right",
        scrollToTarget: false,
    },
    {
        id: "page-instagram",
        title: "Automate Your DMs",
        description: "Connect your Instagram profile here to automatically reply to people who mention you in their Stories or send you direct messages.",
        target: "header",
        placement: "bottom",
        route: "/dashboard/instagram",
        scrollToTarget: false,
    },
    {
        id: "nav-ai-training",
        title: "AI Training",
        description: "This is the most powerful feature in BotChat: The AI Brain. Let's see how it works.",
        target: "[data-tour='sidebar-ai-training']",
        placement: "right",
        scrollToTarget: false,
    },
    {
        id: "page-ai-training",
        title: "Teach Your AI",
        description: "You don't need to code anything! Just give the AI a link to your website or upload a PDF. It will magically read everything and talk to your customers like you do.",
        target: "header",
        placement: "bottom",
        route: "/dashboard/ai-training",
        scrollToTarget: false,
        youtubeId: "J8HgV4E23u4"
    },
    {
        id: "nav-inbox",
        title: "Smart Inbox",
        description: "What if the AI doesn't know the answer, or a human wants to take over? Let's go to the Smart Inbox.",
        target: "[data-tour='sidebar-inbox']",
        placement: "right",
        scrollToTarget: false,
    },
    {
        id: "page-inbox",
        title: "Talk to Customers",
        description: "Any time your bots can't answer a question, the conversation gets paused and sent here. You can jump in and resume chatting with your customer manually.",
        target: "header",
        placement: "bottom",
        route: "/social/smart-inbox",
        scrollToTarget: false,
    },
    {
        id: "theme-toggle",
        title: "Dark or Light Mode",
        description: "Prefer a different look? You can toggle Light Mode and Dark Mode instantly by clicking this button.",
        target: "[data-tour='topbar-theme']",
        placement: "bottom",
        route: "/dashboard",
        scrollToTarget: false,
    },
    {
        id: "finish-settings",
        title: "You're All Set! 🎉",
        description: "That's it for the tour! You can adjust all your account settings, appearance, and billing right here. Dive in and start automating!",
        target: "header",
        placement: "bottom",
        route: "/dashboard/settings",
        scrollToTarget: false,
    }
];

export default tourSteps;
