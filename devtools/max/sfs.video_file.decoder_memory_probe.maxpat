{
    "patcher": {
        "fileversion": 1,
        "appversion": {
            "major": 8,
            "minor": 6,
            "revision": 0,
            "architecture": "x64",
            "modernui": 1
        },
        "classnamespace": "box",
        "rect": [140.0, 140.0, 760.0, 460.0],
        "bglocked": 0,
        "openinpresentation": 0,
        "default_fontsize": 12.0,
        "default_fontface": 0,
        "default_fontname": "Arial",
        "gridonopen": 1,
        "gridsize": [15.0, 15.0],
        "gridsnaponopen": 1,
        "objectsnaponopen": 1,
        "statusbarvisible": 2,
        "toolbarvisible": 1,
        "description": "Decoder-only memory probe for jit.movie AVI playback",
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "jit.movie Decoder Memory Probe",
                    "patching_rect": [30.0, 25.0, 280.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Decoder playback and preview only; stops at 20 seconds and disposes media at 30 seconds.",
                    "patching_rect": [30.0, 50.0, 620.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "newobj",
                    "text": "loadbang",
                    "patching_rect": [30.0, 95.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "message",
                    "text": "read \"D:/tmp/sfs_project/devtools/testdata/Aesthetics Visuals 2020 compilation (1).mp4\"",
                    "patching_rect": [110.0, 95.0, 390.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "newobj",
                    "text": "jit.movie @engine viddll @cache_size 0.02 @unique 1 @adapt 1 @autostart 0 @loop 0",
                    "patching_rect": [110.0, 155.0, 285.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "jit.pwindow",
                    "patching_rect": [420.0, 155.0, 288.0, 216.0]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "text": "qmetro 33",
                    "patching_rect": [30.0, 185.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "newobj",
                    "text": "delay 500",
                    "patching_rect": [30.0, 125.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "message",
                    "text": "1",
                    "patching_rect": [30.0, 155.0, 35.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "message",
                    "text": "start",
                    "patching_rect": [330.0, 95.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "newobj",
                    "text": "delay 20000",
                    "patching_rect": [30.0, 240.0, 90.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "message",
                    "text": "0",
                    "patching_rect": [30.0, 275.0, 35.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "message",
                    "text": "stop",
                    "patching_rect": [75.0, 275.0, 45.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "newobj",
                    "text": "delay 30000",
                    "patching_rect": [145.0, 240.0, 90.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "message",
                    "text": "dispose",
                    "patching_rect": [145.0, 275.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "newobj",
                    "text": "delay 31000",
                    "patching_rect": [255.0, 240.0, 90.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "message",
                    "text": "write \"D:/tmp/sfs_project/logs/max/sfs-max-console.txt\"",
                    "patching_rect": [255.0, 275.0, 340.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "text": "console",
                    "patching_rect": [610.0, 275.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-19",
                    "maxclass": "message",
                    "text": "clear",
                    "patching_rect": [510.0, 95.0, 45.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-20",
                    "maxclass": "message",
                    "text": "probe_done",
                    "patching_rect": [255.0, 310.0, 80.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "newobj",
                    "text": "print sfs.video_file.decoder_memory_probe",
                    "patching_rect": [255.0, 345.0, 260.0, 22.0]
                }
            }
        ],
        "lines": [
            { "patchline": { "source": ["obj-3", 0], "destination": ["obj-4", 0] } },
            { "patchline": { "source": ["obj-3", 0], "destination": ["obj-8", 0] } },
            { "patchline": { "source": ["obj-3", 0], "destination": ["obj-11", 0] } },
            { "patchline": { "source": ["obj-3", 0], "destination": ["obj-14", 0] } },
            { "patchline": { "source": ["obj-3", 0], "destination": ["obj-16", 0] } },
            { "patchline": { "source": ["obj-3", 0], "destination": ["obj-19", 0] } },
            { "patchline": { "source": ["obj-4", 0], "destination": ["obj-5", 0] } },
            { "patchline": { "source": ["obj-5", 0], "destination": ["obj-6", 0] } },
            { "patchline": { "source": ["obj-7", 0], "destination": ["obj-5", 0] } },
            { "patchline": { "source": ["obj-8", 0], "destination": ["obj-9", 0] } },
            { "patchline": { "source": ["obj-8", 0], "destination": ["obj-10", 0] } },
            { "patchline": { "source": ["obj-9", 0], "destination": ["obj-7", 0] } },
            { "patchline": { "source": ["obj-10", 0], "destination": ["obj-5", 0] } },
            { "patchline": { "source": ["obj-11", 0], "destination": ["obj-12", 0] } },
            { "patchline": { "source": ["obj-11", 0], "destination": ["obj-13", 0] } },
            { "patchline": { "source": ["obj-12", 0], "destination": ["obj-7", 0] } },
            { "patchline": { "source": ["obj-13", 0], "destination": ["obj-5", 0] } },
            { "patchline": { "source": ["obj-14", 0], "destination": ["obj-15", 0] } },
            { "patchline": { "source": ["obj-15", 0], "destination": ["obj-5", 0] } },
            { "patchline": { "source": ["obj-16", 0], "destination": ["obj-17", 0] } },
            { "patchline": { "source": ["obj-16", 0], "destination": ["obj-20", 0] } },
            { "patchline": { "source": ["obj-17", 0], "destination": ["obj-18", 0] } },
            { "patchline": { "source": ["obj-19", 0], "destination": ["obj-18", 0] } },
            { "patchline": { "source": ["obj-20", 0], "destination": ["obj-21", 0] } }
        ]
    }
}
