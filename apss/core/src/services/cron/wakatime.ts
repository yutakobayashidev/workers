import { DiscordClient } from "@/clients/discord";
import { HonoConfig } from "@/config";

export async function fetchWakaTimeStats(WAKATIME_API_KEY: string): Promise<any> {
    const response = await fetch(`https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=${WAKATIME_API_KEY}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch WakaTime stats: ${response.statusText}`);
    }

    return response.json();
}

function generateQuickChartUrl(languages: { name: string; percent: number }[]): string {
    const chartConfig = {
        type: 'doughnut',
        data: {
            labels: languages.map((lang) => lang.name),
            datasets: [
                {
                    data: languages.map((lang) => lang.percent),
                },
            ],
        },
    };

    return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
}


export async function sendWakaTimeStats(env: HonoConfig["Bindings"]): Promise<void> {

    const stats = await fetchWakaTimeStats(env.WAKATIME_API_KEY);
    const languages = stats.data.languages.slice(0, 5);
    const chartUrl = generateQuickChartUrl(languages);

    const client = new DiscordClient(env.DISCORD_TOKEN, env.DISCORD_APPLICATION_ID);

    await client.sendMessage({
        channelId: env.CHANNEL_ID,
        body: {
            embeds: [
                {
                    title: 'Weekly Coding Activity',
                    fields: [
                        {
                            name: 'Total coding time',
                            value: stats.data.human_readable_total,
                            inline: true,
                        },
                        {
                            name: 'Daily average',
                            value: stats.data.human_readable_daily_average,
                            inline: true,
                        },
                        {
                            name: 'Top languages',
                            value: languages.map((lang: any) => `${lang.name}: ${lang.percent}%`).join('\n'),
                        },
                    ],
                    image: {
                        url: chartUrl,
                    },
                },
            ],
        }
    });
}
