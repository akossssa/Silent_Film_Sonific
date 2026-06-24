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
        "rect": [60.0, 60.0, 1680.0, 860.0],
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
        "description": "Manual Layer A to Layer B to Layer C test patch with movie/camera source selection",
        "digest": "",
        "tags": "sfs,test,manual,video,interpretation,music-engine",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "Layer A -> Layer B -> Layer C Manual Test",
                    "patching_rect": [30.0, 20.0, 420.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Select movie or camera. The selected video is previewed, analyzed by Layer A, interpreted by Layer B, stepped through Layer C, and logged to project logs.",
                    "patching_rect": [30.0, 45.0, 1030.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "toggle",
                    "patching_rect": [30.0, 82.0, 24.0, 24.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "text": "qmetro 33",
                    "patching_rect": [65.0, 83.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "comment",
                    "text": "run",
                    "patching_rect": [30.0, 110.0, 40.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "message",
                    "text": "read",
                    "patching_rect": [160.0, 82.0, 45.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "message",
                    "text": "start",
                    "patching_rect": [215.0, 82.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "message",
                    "text": "stop",
                    "patching_rect": [275.0, 82.0, 45.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "message",
                    "text": "1",
                    "patching_rect": [335.0, 82.0, 35.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "comment",
                    "text": "movie",
                    "patching_rect": [335.0, 108.0, 55.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "message",
                    "text": "2",
                    "patching_rect": [410.0, 82.0, 35.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "comment",
                    "text": "camera",
                    "patching_rect": [410.0, 108.0, 60.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "message",
                    "text": "open",
                    "patching_rect": [480.0, 82.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "message",
                    "text": "close",
                    "patching_rect": [540.0, 82.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "message",
                    "text": "reset",
                    "patching_rect": [620.0, 82.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "comment",
                    "text": "reset",
                    "patching_rect": [620.0, 108.0, 55.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "newobj",
                    "text": "jit.movie @engine viddll @cache_size 0.02 @unique 1 @adapt 1 @autostart 0 @loop 1",
                    "patching_rect": [160.0, 130.0, 270.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "newobj",
                    "text": "jit.grab",
                    "patching_rect": [480.0, 130.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-19",
                    "maxclass": "newobj",
                    "text": "switch 2",
                    "patching_rect": [300.0, 165.0, 80.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-20",
                    "maxclass": "comment",
                    "text": "video preview",
                    "patching_rect": [30.0, 160.0, 120.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "jit.pwindow",
                    "patching_rect": [30.0, 190.0, 500.0, 375.0]
                }
            },
            {
                "box": {
                    "id": "obj-22",
                    "maxclass": "comment",
                    "text": "Layer A: SFS_VIDEO_FEATURES",
                    "patching_rect": [560.0, 145.0, 260.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-23",
                    "maxclass": "newobj",
                    "text": "js D:/tmp/sfs_project/patchers/sfs.video_analysis.basic_motion.js",
                    "patching_rect": [560.0, 175.0, 430.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "newobj",
                    "text": "js sfs.video_features.monitor.js",
                    "patching_rect": [560.0, 215.0, 215.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "newobj",
                    "text": "js sfs.validate_video_features.js",
                    "patching_rect": [785.0, 215.0, 215.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-26",
                    "maxclass": "newobj",
                    "text": "route valid",
                    "patching_rect": [785.0, 245.0, 215.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-27",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [645.0, 255.0, 255.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-28",
                    "maxclass": "comment",
                    "text": "source",
                    "patching_rect": [560.0, 256.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-29",
                    "maxclass": "flonum",
                    "patching_rect": [645.0, 290.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-30",
                    "maxclass": "comment",
                    "text": "motion",
                    "patching_rect": [560.0, 292.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-31",
                    "maxclass": "flonum",
                    "patching_rect": [645.0, 320.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-32",
                    "maxclass": "comment",
                    "text": "brightness",
                    "patching_rect": [560.0, 322.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-33",
                    "maxclass": "flonum",
                    "patching_rect": [645.0, 350.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-34",
                    "maxclass": "comment",
                    "text": "contrast",
                    "patching_rect": [560.0, 352.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-35",
                    "maxclass": "toggle",
                    "patching_rect": [645.0, 382.0, 22.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-36",
                    "maxclass": "comment",
                    "text": "cut",
                    "patching_rect": [560.0, 384.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-37",
                    "maxclass": "flonum",
                    "patching_rect": [645.0, 415.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-38",
                    "maxclass": "comment",
                    "text": "cut strength",
                    "patching_rect": [560.0, 417.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-39",
                    "maxclass": "number",
                    "patching_rect": [645.0, 445.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-40",
                    "maxclass": "comment",
                    "text": "frame",
                    "patching_rect": [560.0, 447.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-41",
                    "maxclass": "comment",
                    "text": "Layer B: SFS_MUSICAL_CONTROL",
                    "patching_rect": [840.0, 290.0, 300.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-42",
                    "maxclass": "newobj",
                    "text": "js D:/tmp/sfs_project/patchers/sfs.interpretation.state_machine.js",
                    "patching_rect": [840.0, 320.0, 455.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-43",
                    "maxclass": "newobj",
                    "text": "js sfs.musical_control.monitor.js",
                    "patching_rect": [840.0, 360.0, 230.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-44",
                    "maxclass": "newobj",
                    "text": "js sfs.validate_musical_control.js",
                    "patching_rect": [1085.0, 360.0, 220.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-45",
                    "maxclass": "newobj",
                    "text": "route valid",
                    "patching_rect": [1085.0, 390.0, 220.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-46",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [840.0, 400.0, 410.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-47",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [930.0, 435.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-48",
                    "maxclass": "comment",
                    "text": "state",
                    "patching_rect": [840.0, 437.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-49",
                    "maxclass": "flonum",
                    "patching_rect": [930.0, 465.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-50",
                    "maxclass": "comment",
                    "text": "confidence",
                    "patching_rect": [840.0, 467.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-51",
                    "maxclass": "toggle",
                    "patching_rect": [930.0, 497.0, 22.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-52",
                    "maxclass": "comment",
                    "text": "changed",
                    "patching_rect": [840.0, 499.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-53",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [930.0, 530.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-54",
                    "maxclass": "comment",
                    "text": "previous",
                    "patching_rect": [840.0, 532.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-55",
                    "maxclass": "flonum",
                    "patching_rect": [1125.0, 435.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-56",
                    "maxclass": "comment",
                    "text": "energy",
                    "patching_rect": [1035.0, 437.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-57",
                    "maxclass": "flonum",
                    "patching_rect": [1125.0, 465.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-58",
                    "maxclass": "comment",
                    "text": "density",
                    "patching_rect": [1035.0, 467.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-59",
                    "maxclass": "flonum",
                    "patching_rect": [1125.0, 495.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-60",
                    "maxclass": "comment",
                    "text": "tension",
                    "patching_rect": [1035.0, 497.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-61",
                    "maxclass": "flonum",
                    "patching_rect": [1125.0, 525.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-62",
                    "maxclass": "comment",
                    "text": "brightness",
                    "patching_rect": [1035.0, 527.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-63",
                    "maxclass": "flonum",
                    "patching_rect": [1125.0, 555.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-64",
                    "maxclass": "comment",
                    "text": "activity",
                    "patching_rect": [1035.0, 557.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-65",
                    "maxclass": "flonum",
                    "patching_rect": [1125.0, 585.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-66",
                    "maxclass": "comment",
                    "text": "variation",
                    "patching_rect": [1035.0, 587.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-67",
                    "maxclass": "toggle",
                    "patching_rect": [1245.0, 435.0, 22.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-68",
                    "maxclass": "comment",
                    "text": "scene change",
                    "patching_rect": [1205.0, 465.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-69",
                    "maxclass": "toggle",
                    "patching_rect": [1245.0, 495.0, 22.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-70",
                    "maxclass": "comment",
                    "text": "accent",
                    "patching_rect": [1205.0, 525.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-71",
                    "maxclass": "toggle",
                    "patching_rect": [1245.0, 555.0, 22.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-72",
                    "maxclass": "comment",
                    "text": "reset phrase",
                    "patching_rect": [1205.0, 585.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-73",
                    "maxclass": "newobj",
                    "text": "js sfs.debug.logger.js sfs.layer_abc.manual.video",
                    "patching_rect": [560.0, 610.0, 310.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-74",
                    "maxclass": "newobj",
                    "text": "js sfs.debug.logger.js sfs.layer_abc.manual.music",
                    "patching_rect": [900.0, 610.0, 310.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-75",
                    "maxclass": "newobj",
                    "text": "loadbang",
                    "patching_rect": [30.0, 610.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-76",
                    "maxclass": "message",
                    "text": "sample_step 4",
                    "patching_rect": [105.0, 610.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-77",
                    "maxclass": "message",
                    "text": "cut_threshold 0.35",
                    "patching_rect": [210.0, 610.0, 120.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-78",
                    "maxclass": "message",
                    "text": "fps 30",
                    "patching_rect": [340.0, 610.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-79",
                    "maxclass": "message",
                    "text": "smoothing_alpha 0.75",
                    "patching_rect": [105.0, 645.0, 130.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-80",
                    "maxclass": "message",
                    "text": "state_inertia 0.1",
                    "patching_rect": [245.0, 645.0, 115.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-81",
                    "maxclass": "message",
                    "text": "source_type movie",
                    "patching_rect": [700.0, 82.0, 120.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-82",
                    "maxclass": "message",
                    "text": "source_name movie",
                    "patching_rect": [830.0, 82.0, 125.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-83",
                    "maxclass": "message",
                    "text": "source_type camera",
                    "patching_rect": [700.0, 112.0, 125.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-84",
                    "maxclass": "message",
                    "text": "source_name camera",
                    "patching_rect": [835.0, 112.0, 130.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-85",
                    "maxclass": "newobj",
                    "text": "delay 1000",
                    "patching_rect": [30.0, 645.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-86",
                    "maxclass": "message",
                    "text": "write \"D:/tmp/sfs_project/logs/max/sfs-max-console.txt\"",
                    "patching_rect": [30.0, 680.0, 340.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-87",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "text": "console",
                    "patching_rect": [380.0, 680.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-88",
                    "maxclass": "comment",
                    "text": "console export",
                    "patching_rect": [450.0, 681.0, 130.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-89",
                    "maxclass": "message",
                    "text": "verbose 0",
                    "patching_rect": [405.0, 610.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-90",
                    "maxclass": "message",
                    "text": "verbose 0",
                    "patching_rect": [490.0, 610.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-91",
                    "maxclass": "newobj",
                    "text": "gate 2",
                    "patching_rect": [65.0, 130.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-92",
                    "maxclass": "newobj",
                    "text": "qmetro 100",
                    "patching_rect": [390.0, 645.0, 85.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-93",
                    "maxclass": "newobj",
                    "text": "jit.matrix sfs_abc_analysis 4 char 320 180 @adapt 0 @thru 0",
                    "patching_rect": [575.0, 680.0, 390.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-94",
                    "maxclass": "message",
                    "text": "min_level warn",
                    "patching_rect": [575.0, 610.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-95",
                    "maxclass": "message",
                    "text": "snapshot_interval_ms 1000",
                    "patching_rect": [680.0, 610.0, 175.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-96",
                    "maxclass": "comment",
                    "text": "analysis: 10 Hz, 320 x 180",
                    "patching_rect": [575.0, 650.0, 210.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-97",
                    "maxclass": "message",
                    "text": "dispose",
                    "patching_rect": [600.0, 130.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-98",
                    "maxclass": "comment",
                    "text": "unload movie",
                    "patching_rect": [665.0, 132.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-99",
                    "maxclass": "comment",
                    "text": "Layer C: SFS Music Engine MVP",
                    "patching_rect": [1320.0, 145.0, 300.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-100",
                    "maxclass": "newobj",
                    "text": "js sfs.music_engine.step_adapter.js",
                    "patching_rect": [1320.0, 175.0, 245.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-101",
                    "maxclass": "newobj",
                    "text": "js D:/tmp/sfs_project/patchers/sfs.music_engine.core.basic.js",
                    "patching_rect": [1320.0, 210.0, 420.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-102",
                    "maxclass": "newobj",
                    "text": "js sfs.music_engine.monitor.js",
                    "patching_rect": [1320.0, 250.0, 225.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-103",
                    "maxclass": "newobj",
                    "text": "js sfs.debug.logger.js sfs.layer_abc.manual.music_engine",
                    "patching_rect": [1320.0, 810.0, 365.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-104",
                    "maxclass": "newobj",
                    "text": "print sfs.layer_abc.manual.music_engine",
                    "patching_rect": [1585.0, 250.0, 255.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-105",
                    "maxclass": "message",
                    "text": "panic",
                    "patching_rect": [1320.0, 82.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-106",
                    "maxclass": "message",
                    "text": "stop",
                    "patching_rect": [1385.0, 82.0, 45.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-107",
                    "maxclass": "message",
                    "text": "start",
                    "patching_rect": [1440.0, 82.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-108",
                    "maxclass": "message",
                    "text": "reset",
                    "patching_rect": [1500.0, 82.0, 55.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-109",
                    "maxclass": "message",
                    "text": "publish_config",
                    "patching_rect": [1565.0, 82.0, 105.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-110",
                    "maxclass": "message",
                    "text": "auto_step 1",
                    "patching_rect": [875.0, 645.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-111",
                    "maxclass": "message",
                    "text": "step_count 1",
                    "patching_rect": [980.0, 645.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-112",
                    "maxclass": "comment",
                    "text": "Layer C controls",
                    "patching_rect": [1320.0, 108.0, 160.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-113",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [1320.0, 285.0, 420.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-114",
                    "maxclass": "comment",
                    "text": "conductor",
                    "patching_rect": [1745.0, 287.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-115",
                    "maxclass": "number",
                    "patching_rect": [1410.0, 320.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-116",
                    "maxclass": "comment",
                    "text": "tick",
                    "patching_rect": [1320.0, 322.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-117",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [1410.0, 350.0, 95.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-118",
                    "maxclass": "comment",
                    "text": "state",
                    "patching_rect": [1320.0, 352.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-119",
                    "maxclass": "flonum",
                    "patching_rect": [1410.0, 380.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-120",
                    "maxclass": "comment",
                    "text": "tempo",
                    "patching_rect": [1320.0, 382.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-121",
                    "maxclass": "flonum",
                    "patching_rect": [1410.0, 410.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-122",
                    "maxclass": "comment",
                    "text": "energy",
                    "patching_rect": [1320.0, 412.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-123",
                    "maxclass": "flonum",
                    "patching_rect": [1410.0, 440.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-124",
                    "maxclass": "comment",
                    "text": "density",
                    "patching_rect": [1320.0, 442.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-125",
                    "maxclass": "flonum",
                    "patching_rect": [1410.0, 470.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-126",
                    "maxclass": "comment",
                    "text": "tension",
                    "patching_rect": [1320.0, 472.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-127",
                    "maxclass": "toggle",
                    "patching_rect": [1590.0, 320.0, 22.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-128",
                    "maxclass": "comment",
                    "text": "transition",
                    "patching_rect": [1620.0, 322.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-129",
                    "maxclass": "toggle",
                    "patching_rect": [1590.0, 350.0, 22.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-130",
                    "maxclass": "comment",
                    "text": "accent",
                    "patching_rect": [1620.0, 352.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-131",
                    "maxclass": "toggle",
                    "patching_rect": [1590.0, 380.0, 22.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-132",
                    "maxclass": "comment",
                    "text": "reset phrase",
                    "patching_rect": [1620.0, 382.0, 100.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-133",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [1320.0, 515.0, 420.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-134",
                    "maxclass": "comment",
                    "text": "harmony",
                    "patching_rect": [1745.0, 517.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-135",
                    "maxclass": "number",
                    "patching_rect": [1410.0, 550.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-136",
                    "maxclass": "comment",
                    "text": "root pc",
                    "patching_rect": [1320.0, 552.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-137",
                    "maxclass": "flonum",
                    "patching_rect": [1410.0, 580.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-138",
                    "maxclass": "comment",
                    "text": "dissonance",
                    "patching_rect": [1320.0, 582.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-139",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [1320.0, 625.0, 420.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-140",
                    "maxclass": "comment",
                    "text": "note",
                    "patching_rect": [1745.0, 627.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-141",
                    "maxclass": "number",
                    "patching_rect": [1410.0, 660.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-142",
                    "maxclass": "comment",
                    "text": "pitch",
                    "patching_rect": [1320.0, 662.0, 70.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-143",
                    "maxclass": "number",
                    "patching_rect": [1590.0, 660.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-144",
                    "maxclass": "comment",
                    "text": "velocity",
                    "patching_rect": [1500.0, 662.0, 80.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-145",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [1320.0, 695.0, 420.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-146",
                    "maxclass": "comment",
                    "text": "MIDI event",
                    "patching_rect": [1745.0, 697.0, 90.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-147",
                    "maxclass": "message",
                    "text": "-",
                    "patching_rect": [1320.0, 730.0, 420.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-148",
                    "maxclass": "comment",
                    "text": "raw MIDI bytes",
                    "patching_rect": [1745.0, 732.0, 120.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-149",
                    "maxclass": "newobj",
                    "text": "midiout",
                    "patching_rect": [1320.0, 765.0, 70.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-150",
                    "maxclass": "comment",
                    "text": "hardware MIDI out",
                    "patching_rect": [1400.0, 767.0, 150.0, 20.0]
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
                    "destination": ["obj-92", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-4", 0],
                    "destination": ["obj-91", 1]
                }
            },
            {
                "patchline": {
                    "source": ["obj-6", 0],
                    "destination": ["obj-17", 0]
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
                    "destination": ["obj-17", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-8", 0],
                    "destination": ["obj-17", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-9", 0],
                    "destination": ["obj-19", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-9", 0],
                    "destination": ["obj-91", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-9", 0],
                    "destination": ["obj-81", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-9", 0],
                    "destination": ["obj-82", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-9", 0],
                    "destination": ["obj-15", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-19", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-91", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-83", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-84", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-15", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-13", 0],
                    "destination": ["obj-18", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-13", 0],
                    "destination": ["obj-11", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-14", 0],
                    "destination": ["obj-18", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-97", 0],
                    "destination": ["obj-17", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-97", 0],
                    "destination": ["obj-15", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-15", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-15", 0],
                    "destination": ["obj-42", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-17", 0],
                    "destination": ["obj-19", 1]
                }
            },
            {
                "patchline": {
                    "source": ["obj-18", 0],
                    "destination": ["obj-19", 2]
                }
            },
            {
                "patchline": {
                    "source": ["obj-91", 0],
                    "destination": ["obj-17", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-91", 1],
                    "destination": ["obj-18", 0]
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
                    "source": ["obj-19", 0],
                    "destination": ["obj-93", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-92", 0],
                    "destination": ["obj-93", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-93", 0],
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
                    "source": ["obj-23", 0],
                    "destination": ["obj-25", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-23", 0],
                    "destination": ["obj-42", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-23", 0],
                    "destination": ["obj-73", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-23", 1],
                    "destination": ["obj-73", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 0],
                    "destination": ["obj-27", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 1],
                    "destination": ["obj-29", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 2],
                    "destination": ["obj-31", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 3],
                    "destination": ["obj-33", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 4],
                    "destination": ["obj-35", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 5],
                    "destination": ["obj-37", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-24", 6],
                    "destination": ["obj-39", 0]
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
                    "source": ["obj-42", 0],
                    "destination": ["obj-43", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-42", 0],
                    "destination": ["obj-44", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-42", 0],
                    "destination": ["obj-74", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-42", 1],
                    "destination": ["obj-74", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 0],
                    "destination": ["obj-46", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 1],
                    "destination": ["obj-47", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 2],
                    "destination": ["obj-49", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 3],
                    "destination": ["obj-51", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 4],
                    "destination": ["obj-53", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 5],
                    "destination": ["obj-55", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 6],
                    "destination": ["obj-57", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 7],
                    "destination": ["obj-59", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 8],
                    "destination": ["obj-61", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 9],
                    "destination": ["obj-63", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 10],
                    "destination": ["obj-65", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 11],
                    "destination": ["obj-67", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 12],
                    "destination": ["obj-69", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-43", 13],
                    "destination": ["obj-71", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-44", 0],
                    "destination": ["obj-45", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-9", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-76", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-77", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-78", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-79", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-80", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-85", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-89", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-90", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-94", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-95", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-89", 0],
                    "destination": ["obj-25", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-90", 0],
                    "destination": ["obj-44", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-94", 0],
                    "destination": ["obj-73", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-94", 0],
                    "destination": ["obj-74", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-95", 0],
                    "destination": ["obj-73", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-95", 0],
                    "destination": ["obj-74", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-76", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-77", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-78", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-79", 0],
                    "destination": ["obj-42", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-80", 0],
                    "destination": ["obj-42", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-81", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-82", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-83", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-84", 0],
                    "destination": ["obj-23", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-85", 0],
                    "destination": ["obj-86", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-86", 0],
                    "destination": ["obj-87", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-15", 0],
                    "destination": ["obj-101", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-44", 1],
                    "destination": ["obj-100", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-100", 0],
                    "destination": ["obj-101", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-100", 1],
                    "destination": ["obj-103", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-100", 1],
                    "destination": ["obj-104", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 0],
                    "destination": ["obj-102", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 0],
                    "destination": ["obj-103", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 1],
                    "destination": ["obj-102", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 1],
                    "destination": ["obj-103", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 2],
                    "destination": ["obj-102", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 2],
                    "destination": ["obj-103", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 3],
                    "destination": ["obj-102", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 3],
                    "destination": ["obj-103", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 4],
                    "destination": ["obj-102", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 4],
                    "destination": ["obj-104", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 4],
                    "destination": ["obj-149", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 5],
                    "destination": ["obj-103", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-101", 5],
                    "destination": ["obj-104", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-105", 0],
                    "destination": ["obj-101", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-106", 0],
                    "destination": ["obj-101", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-107", 0],
                    "destination": ["obj-101", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-108", 0],
                    "destination": ["obj-101", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-109", 0],
                    "destination": ["obj-101", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-110", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-75", 0],
                    "destination": ["obj-111", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-110", 0],
                    "destination": ["obj-100", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-111", 0],
                    "destination": ["obj-100", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-94", 0],
                    "destination": ["obj-103", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-95", 0],
                    "destination": ["obj-103", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 0],
                    "destination": ["obj-113", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 1],
                    "destination": ["obj-115", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 2],
                    "destination": ["obj-117", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 3],
                    "destination": ["obj-119", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 4],
                    "destination": ["obj-121", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 5],
                    "destination": ["obj-123", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 6],
                    "destination": ["obj-125", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 7],
                    "destination": ["obj-127", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 8],
                    "destination": ["obj-129", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 9],
                    "destination": ["obj-131", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 10],
                    "destination": ["obj-133", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 11],
                    "destination": ["obj-135", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 12],
                    "destination": ["obj-137", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 13],
                    "destination": ["obj-139", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 14],
                    "destination": ["obj-141", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 15],
                    "destination": ["obj-143", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 16],
                    "destination": ["obj-145", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-102", 17],
                    "destination": ["obj-147", 0]
                }
            }
        ]
    }
}
