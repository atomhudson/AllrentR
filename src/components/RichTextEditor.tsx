import React, { useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { uploadBlogImage } from '@/hooks/useBlogs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { LayoutTemplate, PlusCircle, MessageCircleQuestion, CalendarDays, TrendingUp } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const quillRef = useRef<ReactQuill>(null);
    
    // Dialog states
    const [faqOpen, setFaqOpen] = useState(false);
    const [faqQ, setFaqQ] = useState("");
    const [faqA, setFaqA] = useState("");

    const [statOpen, setStatOpen] = useState(false);
    const [statTitle, setStatTitle] = useState("");
    const [statValue, setStatValue] = useState("");
    const [statSubtitle, setStatSubtitle] = useState("");
    const [statColor, setStatColor] = useState("default");
    const [statLayout, setStatLayout] = useState("horizontal");

    const [timelineOpen, setTimelineOpen] = useState(false);
    const [timelineYear, setTimelineYear] = useState("");
    const [timelineEvent, setTimelineEvent] = useState("");

    const insertText = (text: string) => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const range = quill.getSelection(true);
            const index = range ? range.index : quill.getLength();
            quill.insertText(index, `\n${text}\n`);
            quill.setSelection(index + text.length + 2, 0);
        }
    };

    const handleInsertFaq = () => {
        if (!faqQ || !faqA) return toast.error("Please fill all fields");
        // Use a safe delimiter sequence: |||
        insertText(`[[FAQ|||${faqQ}|||${faqA}]]`);
        setFaqOpen(false);
        setFaqQ("");
        setFaqA("");
    };

    const handleInsertStat = () => {
        if (!statTitle || !statValue) return toast.error("Please fill required fields");
        insertText(`[[STAT|||${statTitle}|||${statValue}|||${statSubtitle}|||${statColor}|||${statLayout}]]`);
        setStatOpen(false);
        setStatTitle("");
        setStatValue("");
        setStatSubtitle("");
        setStatColor("default");
        setStatLayout("horizontal");
    };

    const handleInsertTimeline = () => {
        if (!timelineYear || !timelineEvent) return toast.error("Please fill all fields");
        insertText(`[[TIMELINE|||${timelineYear}|||${timelineEvent}]]`);
        setTimelineOpen(false);
        setTimelineYear("");
        setTimelineEvent("");
    };

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;
            if (file) {
                try {
                    const url = await uploadBlogImage(file);
                    const quill = quillRef.current?.getEditor();
                    const range = quill?.getSelection();
                    if (quill) {
                        // If we have a selection, insert at that index, otherwise insert at the end
                        const index = range ? range.index : quill.getLength();
                        quill.insertEmbed(index, 'image', url);
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('Failed to upload image');
                }
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'script': 'sub' }, { 'script': 'super' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-secondary/20 rounded-md border border-border">
                <div className="flex items-center text-sm font-medium text-muted-foreground mr-2">
                    <LayoutTemplate className="w-4 h-4 mr-2" /> Insert:
                </div>
                
                {/* FAQ Dialog */}
                <Dialog open={faqOpen} onOpenChange={setFaqOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8">
                            <MessageCircleQuestion className="w-3 h-3 mr-2" /> FAQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Insert FAQ Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Question</Label>
                                <Input value={faqQ} onChange={e => setFaqQ(e.target.value)} placeholder="What is the price?" />
                            </div>
                            <div>
                                <Label>Answer</Label>
                                <Textarea value={faqA} onChange={e => setFaqA(e.target.value)} placeholder="The price is..." rows={3} />
                            </div>
                            <Button type="button" onClick={handleInsertFaq} className="w-full">Insert FAQ Shortcode</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Stat Dialog */}
                <Dialog open={statOpen} onOpenChange={setStatOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8">
                            <TrendingUp className="w-3 h-3 mr-2" /> Stat Box
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Insert Stat Box</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Title</Label>
                                <Input value={statTitle} onChange={e => setStatTitle(e.target.value)} placeholder="TODAY'S PRICE" />
                            </div>
                            <div>
                                <Label>Value</Label>
                                <Input value={statValue} onChange={e => setStatValue(e.target.value)} placeholder="₹1,201" />
                            </div>
                            <div>
                                <Label>Subtitle (Optional)</Label>
                                <Input value={statSubtitle} onChange={e => setStatSubtitle(e.target.value)} placeholder="As of Apr 24" />
                            </div>
                            <div>
                                <Label>Color Highlight</Label>
                                <select 
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={statColor} onChange={e => setStatColor(e.target.value)}
                                >
                                    <option value="default">Default (White)</option>
                                    <option value="green">Green (Positive)</option>
                                    <option value="red">Red (Negative)</option>
                                    <option value="blue">Blue (Neutral/Info)</option>
                                </select>
                            </div>
                            <div>
                                <Label>Layout</Label>
                                <select 
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                    value={statLayout} onChange={e => setStatLayout(e.target.value)}
                                >
                                    <option value="horizontal">Horizontal (Side-by-side)</option>
                                    <option value="vertical">Vertical (Full width)</option>
                                </select>
                            </div>
                            <Button type="button" onClick={handleInsertStat} className="w-full">Insert Stat Shortcode</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Timeline Dialog */}
                <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-8">
                            <CalendarDays className="w-3 h-3 mr-2" /> Timeline
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Insert Timeline Event</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Year / Period</Label>
                                <Input value={timelineYear} onChange={e => setTimelineYear(e.target.value)} placeholder="2026" />
                            </div>
                            <div>
                                <Label>Event Description</Label>
                                <Textarea value={timelineEvent} onChange={e => setTimelineEvent(e.target.value)} placeholder="Company founded..." rows={2} />
                            </div>
                            <Button type="button" onClick={handleInsertTimeline} className="w-full">Insert Timeline Shortcode</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white text-black rounded-md border border-input" style={{ position: 'relative' }}>
                <ReactQuill
                    ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                placeholder={placeholder}
                style={{ height: '350px' }}
            />
            {/* Spacer for Quill toolbar + padding so nothing overlaps below */}
            <div style={{ height: '50px' }} />
            </div>
        </div>
    );
};

export default RichTextEditor;
