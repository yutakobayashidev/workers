import { BskyAgent, RichText } from '@atproto/api';

export interface BlueskyPost {
    body: string;
    card?: BlueskyCard;
}

export interface BlueskyCard {
    link: string;
    title: string;
    description: string;
    image?: BlueskyImage;
}

export interface BlueskyImage {
    ref: string;
    mimeType: string;
    size: number;
}

export class BlueskyClient {
    private agent: BskyAgent;

    static async ensureLogin(identifier: string, password: string): Promise<void> {
        const client = new BlueskyClient(identifier, password);
        await client.login();
    }

    constructor(private identifier: string, private password: string) {
        this.agent = new BskyAgent({
            service: 'https://bsky.social',
        });
    }

    async login(): Promise<void> {
        await this.agent.login({
            identifier: this.identifier,
            password: this.password,
        });
    }

    async post(post: BlueskyPost) {
        const richText = new RichText({ text: post.body });
        await richText.detectFacets(this.agent);

        const res = await this.agent.post({
            $type: 'app.bsky.feed.post',
            text: richText.text,
            facets: richText.facets,
            createdAt: new Date().toISOString(),
            embed: post.card
                ? {
                    $type: 'app.bsky.embed.external',
                    external: {
                        uri: post.card.link,
                        title: post.card.title,
                        description: post.card.description,
                        thumb: post.card.image
                            ? {
                                $type: 'blob',
                                ref: {
                                    $link: post.card.image.ref,
                                },
                                mimeType: post.card.image.mimeType,
                                size: post.card.image.size,
                            }
                            : undefined,
                    },
                }
                : undefined,
        });

        return res
    }

    async uploadImage(image: Blob): Promise<BlueskyImage> {
        const imageBody = new Uint8Array(await image.arrayBuffer());
        const response = await this.agent.uploadBlob(imageBody, { encoding: image.type });
        return {
            ref: response.data.blob.ref.toString(),
            mimeType: response.data.blob.mimeType,
            size: response.data.blob.size,
        };
    }
}