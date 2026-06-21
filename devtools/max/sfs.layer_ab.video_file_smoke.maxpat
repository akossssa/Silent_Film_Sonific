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
        "rect": [120.0, 120.0, 940.0, 520.0],
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
        "description": "Automated real-video smoke test for Layer A to Layer B",
        "digest": "",
        "tags": "sfs,test,video,interpretation,smoke",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "Layer A -> Layer B Real Video Smoke Runner",
                    "patching_rect": [30.0, 25.0, 330.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Auto-loads the testdata AVI, runs for 20 seconds, and exports Max Console.",
                    "patching_rect": [30.0, 50.0, 760.0, 20.0]
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
                    "text": "read \"D:/tmp/sfs_project/devtools/testdata/Oedipus Rex 1972.avi\"",
                    "patching_rect": [130.0, 95.0, 520.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "newobj",
                    "text": "jit.movie @engine viddll @cache_size 0.02 @unique 1 @adapt 1 @autostart 0 @loop 0",
                    "patching_rect": [130.0, 145.0, 285.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "newobj",
                    "text": "qmetro 33",
                    "patching_rect": [30.0, 205.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "message",
                    "text": "1",
                    "patching_rect": [30.0, 165.0, 35.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "message",
                    "text": "0",
                    "patching_rect": [75.0, 165.0, 35.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "message",
                    "text": "start",
                    "patching_rect": [430.0, 145.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "message",
                    "text": "stop",
                    "patching_rect": [490.0, 145.0, 45.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "newobj",
                    "text": "delay 500",
                    "patching_rect": [30.0, 130.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "newobj",
                    "text": "delay 20000",
                    "patching_rect": [30.0, 260.0, 80.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "text": "delay 21000",
                    "patching_rect": [140.0, 260.0, 80.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "message",
                    "text": "write \"D:/tmp/sfs_project/logs/max/sfs-max-console.txt\"",
                    "patching_rect": [140.0, 305.0, 340.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "text": "console",
                    "patching_rect": [500.0, 305.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "newobj",
                    "text": "js D:/tmp/sfs_project/patchers/sfs.video_analysis.basic_motion.js",
                    "patching_rect": [130.0, 205.0, 430.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "newobj",
                    "text": "js D:/tmp/sfs_project/patchers/sfs.interpretation.state_machine.js",
                    "patching_rect": [130.0, 265.0, 455.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "newobj",
                    "text": "js sfs.validate_video_features.js",
                    "patching_rect": [600.0, 205.0, 215.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-19",
                    "maxclass": "newobj",
                    "text": "js sfs.validate_musical_control.js",
                    "patching_rect": [600.0, 265.0, 220.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-20",
                    "maxclass": "newobj",
                    "text": "route valid",
                    "patching_rect": [830.0, 205.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "newobj",
                    "text": "route valid",
                    "patching_rect": [830.0, 265.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-22",
                    "maxclass": "newobj",
                    "text": "js sfs.debug.logger.js sfs.layer_ab.video_file_smoke.video",
                    "patching_rect": [130.0, 365.0, 370.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-23",
                    "maxclass": "newobj",
                    "text": "js sfs.debug.logger.js sfs.layer_ab.video_file_smoke.music",
                    "patching_rect": [130.0, 405.0, 370.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "message",
                    "text": "source_type movie",
                    "patching_rect": [600.0, 95.0, 115.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "message",
                    "text": "source_name Oedipus Rex 1972.avi",
                    "patching_rect": [600.0, 125.0, 300.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-26",
                    "maxclass": "message",
                    "text": "fps 30",
                    "patching_rect": [600.0, 155.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-27",
                    "maxclass": "message",
                    "text": "sample_step 4",
                    "patching_rect": [665.0, 155.0, 90.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-28",
                    "maxclass": "message",
                    "text": "cut_threshold 0.35",
                    "patching_rect": [765.0, 155.0, 120.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-29",
                    "maxclass": "message",
                    "text": "verbose 0",
                    "patching_rect": [600.0, 335.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-30",
                    "maxclass": "message",
                    "text": "verbose 0",
                    "patching_rect": [685.0, 335.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-31",
                    "maxclass": "message",
                    "text": "reset",
                    "patching_rect": [600.0, 365.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-32",
                    "maxclass": "message",
                    "text": "smoke_done",
                    "patching_rect": [250.0, 305.0, 85.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-33",
                    "maxclass": "newobj",
                    "text": "print sfs.layer_ab.video_file_smoke",
                    "patching_rect": [250.0, 335.0, 230.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-34",
                    "maxclass": "newobj",
                    "text": "qmetro 100",
                    "patching_rect": [30.0, 235.0, 85.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-35",
                    "maxclass": "newobj",
                    "text": "jit.matrix sfs_ab_smoke_analysis 4 char 320 180 @adapt 0 @thru 0",
                    "patching_rect": [130.0, 175.0, 420.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-36",
                    "maxclass": "message",
                    "text": "min_level warn",
                    "patching_rect": [600.0, 395.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-37",
                    "maxclass": "message",
                    "text": "snapshot_interval_ms 1000",
                    "patching_rect": [705.0, 395.0, 175.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-38",
                    "maxclass": "message",
                    "text": "clear",
                    "patching_rect": [570.0, 305.0, 45.0, 22.0]
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
                    "source": ["obj-3", 0],
                    "destination": ["obj-11", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-12", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-13", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-24", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-25", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-26", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-27", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-28", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-29", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-30", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-31", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-36", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-37", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-3", 0],
                    "destination": ["obj-38", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-4", 0],
                    "destination": ["obj-5", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-5", 0],
                    "destination": ["obj-35", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-6", 0],
                    "destination": ["obj-5", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-7", 0],
                    "destination": ["obj-6", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-7", 0],
                    "destination": ["obj-34", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-8", 0],
                    "destination": ["obj-6", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-8", 0],
                    "destination": ["obj-34", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-9", 0],
                    "destination": ["obj-5", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-10", 0],
                    "destination": ["obj-5", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-9", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-7", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-12", 0],
                    "destination": ["obj-8", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-12", 0],
                    "destination": ["obj-10", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-13", 0],
                    "destination": ["obj-14", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-13", 0],
                    "destination": ["obj-32", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-14", 0],
                    "destination": ["obj-15", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-34", 0],
                    "destination": ["obj-35", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-35", 0],
                    "destination": ["obj-16", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-16", 0],
                    "destination": ["obj-17", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-16", 0],
                    "destination": ["obj-18", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-16", 0],
                    "destination": ["obj-22", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-16", 1],
                    "destination": ["obj-22", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-17", 0],
                    "destination": ["obj-19", 0]
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
                    "source": ["obj-17", 1],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-18", 0],
                    "destination": ["obj-20", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-19", 0],
                    "destination": ["obj-21", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 0],
                    "destination": ["obj-16", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-25", 0],
                    "destination": ["obj-16", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-26", 0],
                    "destination": ["obj-16", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-27", 0],
                    "destination": ["obj-16", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-28", 0],
                    "destination": ["obj-16", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-29", 0],
                    "destination": ["obj-18", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-30", 0],
                    "destination": ["obj-19", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-31", 0],
                    "destination": ["obj-16", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-31", 0],
                    "destination": ["obj-17", 0]
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
                    "source": ["obj-36", 0],
                    "destination": ["obj-22", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-36", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-37", 0],
                    "destination": ["obj-22", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-37", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-38", 0],
                    "destination": ["obj-15", 0]
                }
            }
        ]
    }
}
