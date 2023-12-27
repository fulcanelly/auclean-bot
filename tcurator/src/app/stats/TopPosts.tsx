// 'use client';

import VisibilityIcon from '@mui/icons-material/Visibility';
import MicIcon from '@mui/icons-material/Mic';

const PostItem = ({ post_id, views, text, date, author, telegramLink }: ViewInfo & { telegramLink: string }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center mb-4">
        <div>
            <h3 className="text-lg font-semibold">{author}</h3>
            <p className="text-gray-600">{text}</p>
            <div className="flex items-center text-gray-500 mt-2">
                <VisibilityIcon className="text-gray-700" />
                <span className="ml-1">{views}</span>
                <span className="mx-2">•</span>
                <span>{date}</span>
            </div>
        </div>
        <a href={telegramLink} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-500">
            <MicIcon />
            <span className="ml-1">View in Telegram</span>
        </a>
    </div>
);



function makeLinkToPost(username, id) {
    return `https://t.me/${username}/${id}`
}

type ViewInfo = {
    post_id: number;
    views: number;
    text?: string;
    date?: string;
    author?: string;
};


export default function TopPosts({ views, username }: { views: ViewInfo[] | undefined, username: string }) {
    if (!views) {
        return
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Top Posts</h2>
            <div className="border p-4 rounded-lg">
                {views.map((view) => (
                    <PostItem key={view.post_id} {...view} text={'test'} telegramLink={makeLinkToPost(username, view.post_id)} />
                ))}
            </div>
        </div>
    );
}
