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
        "rect": [80.0, 80.0, 1120.0, 720.0],
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
        "lefttoolbarpinned": 0,
        "toptoolbarpinned": 0,
        "righttoolbarpinned": 0,
        "bottomtoolbarpinned": 0,
        "toolbars_unpinned_last_save": 0,
        "tallnewobj": 0,
        "boxanimatetime": 200,
        "enablehscroll": 1,
        "enablevscroll": 1,
        "devicewidth": 0.0,
        "description": "Manual test harness for sfs.video_analysis.basic_motion",
        "digest": "",
        "tags": "sfs,test,video",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "Layer A Test Harness",
                    "patching_rect": [30.0, 25.0, 220.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Use one source at a time. The validator prints valid 1 when the SFS_VIDEO_FEATURES contract is satisfied.",
                    "patching_rect": [30.0, 50.0, 650.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "toggle",
                    "patching_rect": [30.0, 95.0, 24.0, 24.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "text": "qmetro 33",
                    "patching_rect": [70.0, 96.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "comment",
                    "text": "clock",
                    "patching_rect": [30.0, 125.0, 50.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "message",
                    "text": "read",
                    "patching_rect": [190.0, 95.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "message",
                    "text": "start",
                    "patching_rect": [250.0, 95.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "message",
                    "text": "stop",
                    "patching_rect": [310.0, 95.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "newobj",
                    "text": "jit.movie @adapt 1 @autostart 0",
                    "patching_rect": [190.0, 135.0, 315.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "message",
                    "text": "source_type movie",
                    "patching_rect": [190.0, 175.0, 115.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "message",
                    "text": "fps 30",
                    "patching_rect": [315.0, 175.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "newobj",
                    "text": "jit.noise 4 char 320 240",
                    "patching_rect": [745.0, 135.0, 160.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-32",
                    "maxclass": "toggle",
                    "patching_rect": [745.0, 95.0, 24.0, 24.0]
                }
            },
            {
                "box": {
                    "id": "obj-33",
                    "maxclass": "newobj",
                    "text": "qmetro 33",
                    "patching_rect": [785.0, 96.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-34",
                    "maxclass": "comment",
                    "text": "noise clock",
                    "patching_rect": [870.0, 99.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "message",
                    "text": "source_type matrix",
                    "patching_rect": [745.0, 175.0, 125.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "newobj",
                    "text": "jit.matrix 4 char 320 240",
                    "patching_rect": [30.0, 260.0, 165.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-19",
                    "maxclass": "message",
                    "text": "setall 0, bang",
                    "patching_rect": [30.0, 220.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-20",
                    "maxclass": "message",
                    "text": "setall 255, bang",
                    "patching_rect": [135.0, 220.0, 105.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "message",
                    "text": "reset",
                    "patching_rect": [250.0, 220.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-22",
                    "maxclass": "comment",
                    "text": "Static tests: reset, send black twice, send white twice, alternate black/white for cut detection.",
                    "patching_rect": [30.0, 195.0, 590.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-23",
                    "maxclass": "newobj",
                    "text": "sfs.video_analysis.basic_motion",
                    "patching_rect": [420.0, 330.0, 210.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "newobj",
                    "text": "t a a",
                    "patching_rect": [420.0, 380.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "newobj",
                    "text": "js sfs.validate_video_features.js",
                    "patching_rect": [360.0, 430.0, 205.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-26",
                    "maxclass": "newobj",
                    "text": "print sfs.video_features.valid",
                    "patching_rect": [320.0, 480.0, 180.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-29",
                    "maxclass": "comment",
                    "text": "Expected: black stable => brightness/motion/contrast near 0; white stable => brightness near 1, motion near 0; noise => motion/contrast high; black to white => cut true.",
                    "linecount": 3,
                    "patching_rect": [30.0, 310.0, 330.0, 50.0]
                }
            },
            {
                "box": {
                    "id": "obj-30",
                    "maxclass": "message",
                    "text": "sample_step 8",
                    "patching_rect": [420.0, 260.0, 90.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-31",
                    "maxclass": "message",
                    "text": "cut_threshold 0.35",
                    "patching_rect": [520.0, 260.0, 120.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-36",
                    "maxclass": "newobj",
                    "text": "loadbang",
                    "patching_rect": [725.0, 255.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-37",
                    "maxclass": "newobj",
                    "text": "delay 1000",
                    "patching_rect": [725.0, 285.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-38",
                    "maxclass": "message",
                    "text": "write \"D:/My Music/Max/PROJECTS/Silent_Film_Sonific/logs/max/sfs-max-console.txt\"",
                    "patching_rect": [725.0, 315.0, 340.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-39",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "text": "console",
                    "patching_rect": [725.0, 345.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-40",
                    "maxclass": "comment",
                    "text": "console export",
                    "patching_rect": [805.0, 345.0, 165.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-41",
                    "maxclass": "comment",
                    "text": "Auto-writes Max Console to logs/max/sfs-max-console.txt after patch load.",
                    "patching_rect": [725.0, 375.0, 360.0, 20.0]
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-4", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-4", 0],
                    "destination": ["obj-9", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-6", 0],
                    "destination": ["obj-9", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-7", 0],
                    "destination": ["obj-9", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-8", 0],
                    "destination": ["obj-9", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-9", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-10", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-16", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-32", 0],
                    "destination": ["obj-33", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-33", 0],
                    "destination": ["obj-16", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-17", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-18", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-19", 0],
                    "destination": ["obj-18", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-20", 0],
                    "destination": ["obj-18", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-21", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-23", 0],
                    "destination": ["obj-24", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 0],
                    "destination": ["obj-25", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-25", 0],
                    "destination": ["obj-26", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-30", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-31", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-36", 0],
                    "destination": ["obj-37", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-37", 0],
                    "destination": ["obj-38", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-38", 0],
                    "destination": ["obj-39", 0]
                }
            }
        ]
    }
}
