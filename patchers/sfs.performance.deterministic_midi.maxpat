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
        "rect": [
            40,
            40,
            1720,
            1030
        ],
        "bglocked": 0,
        "openinpresentation": 0,
        "default_fontsize": 12,
        "default_fontface": 0,
        "default_fontname": "Arial",
        "gridonopen": 1,
        "gridsize": [
            15,
            15
        ],
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
        "devicewidth": 0,
        "description": "Short performance entry point for the SFS Layer A/B/C Deterministic MIDI UI patch",
        "digest": "",
        "tags": "sfs,performance,deterministic-midi,layer-abc",
        "boxes": [
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        30,
                        500,
                        22
                    ],
                    "text": "Silent Film Sonific - Layer A/B/C Deterministic MIDI Performance"
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        54,
                        495,
                        34
                    ],
                    "text": "Production UI patch. Data path: video -> SFS_VIDEO_FEATURES -> SFS_MUSICAL_CONTROL -> Deterministic MIDI Engine.",
                    "linecount": 2
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        88,
                        180,
                        20
                    ],
                    "text": "Source and Preview"
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "toggle",
                    "patching_rect": [
                        30,
                        118,
                        24,
                        24
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "comment",
                    "patching_rect": [
                        60,
                        120,
                        40,
                        20
                    ],
                    "text": "run"
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "patching_rect": [
                        110,
                        118,
                        75,
                        22
                    ],
                    "text": "qmetro 33"
                }
            },
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "newobj",
                    "patching_rect": [
                        195,
                        118,
                        85,
                        22
                    ],
                    "text": "qmetro 100"
                }
            },
            {
                "box": {
                    "id": "obj-15",
                    "maxclass": "comment",
                    "patching_rect": [
                        290,
                        120,
                        210,
                        20
                    ],
                    "text": "preview 30 Hz / analysis 10 Hz"
                }
            },
            {
                "box": {
                    "id": "obj-16",
                    "maxclass": "message",
                    "patching_rect": [
                        30,
                        154,
                        50,
                        22
                    ],
                    "text": "read"
                }
            },
            {
                "box": {
                    "id": "obj-17",
                    "maxclass": "message",
                    "patching_rect": [
                        90,
                        154,
                        55,
                        22
                    ],
                    "text": "start"
                }
            },
            {
                "box": {
                    "id": "obj-18",
                    "maxclass": "message",
                    "patching_rect": [
                        155,
                        154,
                        50,
                        22
                    ],
                    "text": "stop"
                }
            },
            {
                "box": {
                    "id": "obj-19",
                    "maxclass": "message",
                    "patching_rect": [
                        215,
                        154,
                        60,
                        22
                    ],
                    "text": "dispose"
                }
            },
            {
                "box": {
                    "id": "obj-20",
                    "maxclass": "comment",
                    "patching_rect": [
                        285,
                        156,
                        105,
                        20
                    ],
                    "text": "movie controls"
                }
            },
            {
                "box": {
                    "id": "obj-21",
                    "maxclass": "message",
                    "patching_rect": [
                        30,
                        190,
                        35,
                        22
                    ],
                    "text": "1"
                }
            },
            {
                "box": {
                    "id": "obj-22",
                    "maxclass": "comment",
                    "patching_rect": [
                        75,
                        192,
                        95,
                        20
                    ],
                    "text": "movie source"
                }
            },
            {
                "box": {
                    "id": "obj-23",
                    "maxclass": "message",
                    "patching_rect": [
                        180,
                        190,
                        35,
                        22
                    ],
                    "text": "2"
                }
            },
            {
                "box": {
                    "id": "obj-24",
                    "maxclass": "comment",
                    "patching_rect": [
                        225,
                        192,
                        100,
                        20
                    ],
                    "text": "camera source"
                }
            },
            {
                "box": {
                    "id": "obj-25",
                    "maxclass": "message",
                    "patching_rect": [
                        330,
                        190,
                        50,
                        22
                    ],
                    "text": "open"
                }
            },
            {
                "box": {
                    "id": "obj-26",
                    "maxclass": "message",
                    "patching_rect": [
                        390,
                        190,
                        55,
                        22
                    ],
                    "text": "close"
                }
            },
            {
                "box": {
                    "id": "obj-27",
                    "maxclass": "newobj",
                    "patching_rect": [
                        30,
                        230,
                        430,
                        22
                    ],
                    "text": "jit.movie @engine viddll @cache_size 0.02 @unique 1 @adapt 1 @autostart 0 @loop 1"
                }
            },
            {
                "box": {
                    "id": "obj-28",
                    "maxclass": "newobj",
                    "patching_rect": [
                        30,
                        260,
                        70,
                        22
                    ],
                    "text": "jit.grab"
                }
            },
            {
                "box": {
                    "id": "obj-29",
                    "maxclass": "newobj",
                    "patching_rect": [
                        290,
                        118,
                        60,
                        22
                    ],
                    "text": "gate 2"
                }
            },
            {
                "box": {
                    "id": "obj-30",
                    "maxclass": "newobj",
                    "patching_rect": [
                        360,
                        260,
                        75,
                        22
                    ],
                    "text": "switch 2"
                }
            },
            {
                "box": {
                    "id": "obj-31",
                    "maxclass": "jit.pwindow",
                    "patching_rect": [
                        30,
                        295,
                        500,
                        195
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-32",
                    "maxclass": "newobj",
                    "patching_rect": [
                        30,
                        498,
                        380,
                        22
                    ],
                    "text": "jit.matrix sfs_abc_analysis 4 char 320 180 @adapt 0 @thru 0"
                }
            },
            {
                "box": {
                    "id": "obj-33",
                    "maxclass": "comment",
                    "patching_rect": [
                        420,
                        500,
                        115,
                        20
                    ],
                    "text": "analysis matrix: 320 x 180"
                }
            },
            {
                "box": {
                    "id": "obj-34",
                    "maxclass": "comment",
                    "patching_rect": [
                        570,
                        32,
                        230,
                        20
                    ],
                    "text": "Layer A: SFS_VIDEO_FEATURES"
                }
            },
            {
                "box": {
                    "id": "obj-35",
                    "maxclass": "newobj",
                    "patching_rect": [
                        570,
                        62,
                        230,
                        22
                    ],
                    "text": "sfs.video_analysis.basic_motion"
                }
            },
            {
                "box": {
                    "id": "obj-36",
                    "maxclass": "newobj",
                    "patching_rect": [
                        570,
                        95,
                        305,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js video_monitor"
                }
            },
            {
                "box": {
                    "id": "obj-37",
                    "maxclass": "message",
                    "patching_rect": [
                        650,
                        130,
                        245,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-38",
                    "maxclass": "comment",
                    "patching_rect": [
                        570,
                        132,
                        70,
                        20
                    ],
                    "text": "source"
                }
            },
            {
                "box": {
                    "id": "obj-39",
                    "maxclass": "flonum",
                    "patching_rect": [
                        650,
                        165,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-40",
                    "maxclass": "comment",
                    "patching_rect": [
                        570,
                        167,
                        70,
                        20
                    ],
                    "text": "motion"
                }
            },
            {
                "box": {
                    "id": "obj-41",
                    "maxclass": "flonum",
                    "patching_rect": [
                        650,
                        195,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-42",
                    "maxclass": "comment",
                    "patching_rect": [
                        570,
                        197,
                        80,
                        20
                    ],
                    "text": "brightness"
                }
            },
            {
                "box": {
                    "id": "obj-43",
                    "maxclass": "flonum",
                    "patching_rect": [
                        650,
                        225,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-44",
                    "maxclass": "comment",
                    "patching_rect": [
                        570,
                        227,
                        70,
                        20
                    ],
                    "text": "contrast"
                }
            },
            {
                "box": {
                    "id": "obj-45",
                    "maxclass": "toggle",
                    "patching_rect": [
                        650,
                        255,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-46",
                    "maxclass": "comment",
                    "patching_rect": [
                        570,
                        257,
                        70,
                        20
                    ],
                    "text": "cut"
                }
            },
            {
                "box": {
                    "id": "obj-47",
                    "maxclass": "flonum",
                    "patching_rect": [
                        650,
                        285,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-48",
                    "maxclass": "comment",
                    "patching_rect": [
                        570,
                        287,
                        85,
                        20
                    ],
                    "text": "cut strength"
                }
            },
            {
                "box": {
                    "id": "obj-49",
                    "maxclass": "number",
                    "patching_rect": [
                        650,
                        315,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-50",
                    "maxclass": "comment",
                    "patching_rect": [
                        570,
                        317,
                        70,
                        20
                    ],
                    "text": "frame"
                }
            },
            {
                "box": {
                    "id": "obj-51",
                    "maxclass": "comment",
                    "patching_rect": [
                        940,
                        32,
                        250,
                        20
                    ],
                    "text": "Layer B: SFS_MUSICAL_CONTROL"
                }
            },
            {
                "box": {
                    "id": "obj-52",
                    "maxclass": "newobj",
                    "patching_rect": [
                        940,
                        62,
                        230,
                        22
                    ],
                    "text": "sfs.interpretation.state_machine"
                }
            },
            {
                "box": {
                    "id": "obj-53",
                    "maxclass": "newobj",
                    "patching_rect": [
                        940,
                        95,
                        315,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js musical_monitor"
                }
            },
            {
                "box": {
                    "id": "obj-54",
                    "maxclass": "message",
                    "patching_rect": [
                        940,
                        130,
                        340,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-55",
                    "maxclass": "message",
                    "patching_rect": [
                        1030,
                        165,
                        105,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-56",
                    "maxclass": "comment",
                    "patching_rect": [
                        940,
                        167,
                        70,
                        20
                    ],
                    "text": "state"
                }
            },
            {
                "box": {
                    "id": "obj-57",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1030,
                        195,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-58",
                    "maxclass": "comment",
                    "patching_rect": [
                        940,
                        197,
                        80,
                        20
                    ],
                    "text": "confidence"
                }
            },
            {
                "box": {
                    "id": "obj-59",
                    "maxclass": "toggle",
                    "patching_rect": [
                        1030,
                        225,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-60",
                    "maxclass": "comment",
                    "patching_rect": [
                        940,
                        227,
                        70,
                        20
                    ],
                    "text": "changed"
                }
            },
            {
                "box": {
                    "id": "obj-61",
                    "maxclass": "message",
                    "patching_rect": [
                        1030,
                        255,
                        105,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-62",
                    "maxclass": "comment",
                    "patching_rect": [
                        940,
                        257,
                        80,
                        20
                    ],
                    "text": "previous"
                }
            },
            {
                "box": {
                    "id": "obj-63",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1210,
                        165,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-64",
                    "maxclass": "comment",
                    "patching_rect": [
                        1140,
                        167,
                        65,
                        20
                    ],
                    "text": "energy"
                }
            },
            {
                "box": {
                    "id": "obj-65",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1210,
                        195,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-66",
                    "maxclass": "comment",
                    "patching_rect": [
                        1140,
                        197,
                        65,
                        20
                    ],
                    "text": "density"
                }
            },
            {
                "box": {
                    "id": "obj-67",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1210,
                        225,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-68",
                    "maxclass": "comment",
                    "patching_rect": [
                        1140,
                        227,
                        65,
                        20
                    ],
                    "text": "tension"
                }
            },
            {
                "box": {
                    "id": "obj-69",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1210,
                        255,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-70",
                    "maxclass": "comment",
                    "patching_rect": [
                        1140,
                        257,
                        75,
                        20
                    ],
                    "text": "brightness"
                }
            },
            {
                "box": {
                    "id": "obj-71",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1210,
                        285,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-72",
                    "maxclass": "comment",
                    "patching_rect": [
                        1140,
                        287,
                        65,
                        20
                    ],
                    "text": "activity"
                }
            },
            {
                "box": {
                    "id": "obj-73",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1210,
                        315,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-74",
                    "maxclass": "comment",
                    "patching_rect": [
                        1140,
                        317,
                        65,
                        20
                    ],
                    "text": "variation"
                }
            },
            {
                "box": {
                    "id": "obj-75",
                    "maxclass": "toggle",
                    "patching_rect": [
                        1030,
                        295,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-76",
                    "maxclass": "comment",
                    "patching_rect": [
                        940,
                        297,
                        90,
                        20
                    ],
                    "text": "scene change"
                }
            },
            {
                "box": {
                    "id": "obj-77",
                    "maxclass": "toggle",
                    "patching_rect": [
                        1030,
                        325,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-78",
                    "maxclass": "comment",
                    "patching_rect": [
                        940,
                        327,
                        70,
                        20
                    ],
                    "text": "accent"
                }
            },
            {
                "box": {
                    "id": "obj-79",
                    "maxclass": "toggle",
                    "patching_rect": [
                        1030,
                        355,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-80",
                    "maxclass": "comment",
                    "patching_rect": [
                        940,
                        357,
                        90,
                        20
                    ],
                    "text": "reset phrase"
                }
            },
            {
                "box": {
                    "id": "obj-81",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        32,
                        260,
                        20
                    ],
                    "text": "Layer C Outputs / Public Sends"
                }
            },
            {
                "box": {
                    "id": "obj-82",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1330,
                        62,
                        290,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js step_adapter"
                }
            },
            {
                "box": {
                    "id": "obj-83",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1330,
                        95,
                        240,
                        22
                    ],
                    "text": "sfs.music_engine.deterministic_midi"
                }
            },
            {
                "box": {
                    "id": "obj-84",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1330,
                        128,
                        315,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js engine_monitor"
                }
            },
            {
                "box": {
                    "id": "obj-85",
                    "maxclass": "message",
                    "patching_rect": [
                        1330,
                        162,
                        300,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-86",
                    "maxclass": "comment",
                    "patching_rect": [
                        1640,
                        164,
                        70,
                        20
                    ],
                    "text": "conductor"
                }
            },
            {
                "box": {
                    "id": "obj-87",
                    "maxclass": "number",
                    "patching_rect": [
                        1410,
                        195,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-88",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        197,
                        55,
                        20
                    ],
                    "text": "tick"
                }
            },
            {
                "box": {
                    "id": "obj-89",
                    "maxclass": "message",
                    "patching_rect": [
                        1410,
                        225,
                        100,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-90",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        227,
                        55,
                        20
                    ],
                    "text": "state"
                }
            },
            {
                "box": {
                    "id": "obj-91",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1410,
                        255,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-92",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        257,
                        55,
                        20
                    ],
                    "text": "tempo"
                }
            },
            {
                "box": {
                    "id": "obj-93",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1410,
                        285,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-94",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        287,
                        60,
                        20
                    ],
                    "text": "energy"
                }
            },
            {
                "box": {
                    "id": "obj-95",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1410,
                        315,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-96",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        317,
                        60,
                        20
                    ],
                    "text": "density"
                }
            },
            {
                "box": {
                    "id": "obj-97",
                    "maxclass": "flonum",
                    "patching_rect": [
                        1410,
                        345,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-98",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        347,
                        60,
                        20
                    ],
                    "text": "tension"
                }
            },
            {
                "box": {
                    "id": "obj-99",
                    "maxclass": "toggle",
                    "patching_rect": [
                        1580,
                        195,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-100",
                    "maxclass": "comment",
                    "patching_rect": [
                        1610,
                        197,
                        80,
                        20
                    ],
                    "text": "transition"
                }
            },
            {
                "box": {
                    "id": "obj-101",
                    "maxclass": "toggle",
                    "patching_rect": [
                        1580,
                        225,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-102",
                    "maxclass": "comment",
                    "patching_rect": [
                        1610,
                        227,
                        80,
                        20
                    ],
                    "text": "accent"
                }
            },
            {
                "box": {
                    "id": "obj-103",
                    "maxclass": "toggle",
                    "patching_rect": [
                        1580,
                        255,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-104",
                    "maxclass": "comment",
                    "patching_rect": [
                        1610,
                        257,
                        90,
                        20
                    ],
                    "text": "reset phrase"
                }
            },
            {
                "box": {
                    "id": "obj-105",
                    "maxclass": "message",
                    "patching_rect": [
                        1330,
                        380,
                        300,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-106",
                    "maxclass": "comment",
                    "patching_rect": [
                        1640,
                        382,
                        70,
                        20
                    ],
                    "text": "harmony"
                }
            },
            {
                "box": {
                    "id": "obj-107",
                    "maxclass": "message",
                    "patching_rect": [
                        1330,
                        410,
                        300,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-108",
                    "maxclass": "comment",
                    "patching_rect": [
                        1640,
                        412,
                        50,
                        20
                    ],
                    "text": "note"
                }
            },
            {
                "box": {
                    "id": "obj-109",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        542,
                        430,
                        20
                    ],
                    "text": "Layer C User Configuration - SFS_USER_CONFIG v0.1.0"
                }
            },
            {
                "box": {
                    "id": "obj-110",
                    "maxclass": "newobj",
                    "patching_rect": [
                        30,
                        570,
                        310,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js config_monitor"
                }
            },
            {
                "box": {
                    "id": "obj-111",
                    "maxclass": "message",
                    "patching_rect": [
                        350,
                        570,
                        420,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-112",
                    "maxclass": "message",
                    "patching_rect": [
                        780,
                        570,
                        110,
                        22
                    ],
                    "text": "publish_config"
                }
            },
            {
                "box": {
                    "id": "obj-113",
                    "maxclass": "message",
                    "patching_rect": [
                        900,
                        570,
                        125,
                        22
                    ],
                    "text": "reset_to_defaults"
                }
            },
            {
                "box": {
                    "id": "obj-114",
                    "maxclass": "comment",
                    "patching_rect": [
                        1040,
                        572,
                        255,
                        20
                    ],
                    "text": "No preset save/load/import/export UI in this version."
                }
            },
            {
                "box": {
                    "id": "obj-115",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        617,
                        150,
                        20
                    ],
                    "text": "preset name"
                }
            },
            {
                "box": {
                    "id": "obj-116",
                    "maxclass": "textedit",
                    "patching_rect": [
                        185,
                        615,
                        120,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-117",
                    "maxclass": "newobj",
                    "patching_rect": [
                        265,
                        615,
                        230,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js text_param preset_name"
                }
            },
            {
                "box": {
                    "id": "obj-118",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        647,
                        150,
                        20
                    ],
                    "text": "deterministic mode"
                }
            },
            {
                "box": {
                    "id": "obj-119",
                    "maxclass": "toggle",
                    "patching_rect": [
                        185,
                        645,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-120",
                    "maxclass": "newobj",
                    "patching_rect": [
                        220,
                        645,
                        300,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js bool_param reproducibility.deterministic_mode"
                }
            },
            {
                "box": {
                    "id": "obj-121",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        677,
                        150,
                        20
                    ],
                    "text": "random seed"
                }
            },
            {
                "box": {
                    "id": "obj-122",
                    "maxclass": "number",
                    "patching_rect": [
                        185,
                        675,
                        90,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-123",
                    "maxclass": "newobj",
                    "patching_rect": [
                        265,
                        675,
                        230,
                        22
                    ],
                    "text": "prepend param reproducibility.random_seed"
                }
            },
            {
                "box": {
                    "id": "obj-124",
                    "maxclass": "button",
                    "patching_rect": [
                        30,
                        705,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-125",
                    "maxclass": "comment",
                    "patching_rect": [
                        60,
                        707,
                        100,
                        20
                    ],
                    "text": "randomize seed"
                }
            },
            {
                "box": {
                    "id": "obj-126",
                    "maxclass": "newobj",
                    "patching_rect": [
                        185,
                        705,
                        130,
                        22
                    ],
                    "text": "random 2147483647"
                }
            },
            {
                "box": {
                    "id": "obj-127",
                    "maxclass": "newobj",
                    "patching_rect": [
                        325,
                        705,
                        245,
                        22
                    ],
                    "text": "prepend param reproducibility.random_seed"
                }
            },
            {
                "box": {
                    "id": "obj-128",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        737,
                        150,
                        20
                    ],
                    "text": "root pitch class"
                }
            },
            {
                "box": {
                    "id": "obj-129",
                    "maxclass": "number",
                    "patching_rect": [
                        185,
                        735,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-130",
                    "maxclass": "newobj",
                    "patching_rect": [
                        265,
                        735,
                        230,
                        22
                    ],
                    "text": "prepend param musical_identity.root_pitch_class"
                }
            },
            {
                "box": {
                    "id": "obj-131",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        767,
                        150,
                        20
                    ],
                    "text": "scale"
                }
            },
            {
                "box": {
                    "id": "obj-132",
                    "maxclass": "umenu",
                    "patching_rect": [
                        185,
                        765,
                        155,
                        22
                    ],
                    "items": [
                        "major",
                        ",",
                        "natural_minor",
                        ",",
                        "dorian",
                        ",",
                        "phrygian",
                        ",",
                        "whole_tone",
                        ",",
                        "chromatic",
                        ",",
                        "cluster"
                    ],
                    "numoutlets": 3,
                    "outlettype": [
                        "int",
                        "",
                        ""
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-133",
                    "maxclass": "newobj",
                    "patching_rect": [
                        265,
                        765,
                        230,
                        22
                    ],
                    "text": "prepend param musical_identity.scale_name"
                }
            },
            {
                "box": {
                    "id": "obj-134",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        797,
                        150,
                        20
                    ],
                    "text": "harmonic risk"
                }
            },
            {
                "box": {
                    "id": "obj-135",
                    "maxclass": "flonum",
                    "patching_rect": [
                        185,
                        795,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-136",
                    "maxclass": "newobj",
                    "patching_rect": [
                        265,
                        795,
                        230,
                        22
                    ],
                    "text": "prepend param musical_identity.harmonic_risk"
                }
            },
            {
                "box": {
                    "id": "obj-137",
                    "maxclass": "comment",
                    "patching_rect": [
                        30,
                        827,
                        150,
                        20
                    ],
                    "text": "dissonance bias"
                }
            },
            {
                "box": {
                    "id": "obj-138",
                    "maxclass": "flonum",
                    "patching_rect": [
                        185,
                        825,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-139",
                    "maxclass": "newobj",
                    "patching_rect": [
                        265,
                        825,
                        230,
                        22
                    ],
                    "text": "prepend param musical_identity.dissonance_bias"
                }
            },
            {
                "box": {
                    "id": "obj-140",
                    "maxclass": "comment",
                    "patching_rect": [
                        470,
                        617,
                        150,
                        20
                    ],
                    "text": "tempo min"
                }
            },
            {
                "box": {
                    "id": "obj-141",
                    "maxclass": "flonum",
                    "patching_rect": [
                        625,
                        615,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-142",
                    "maxclass": "newobj",
                    "patching_rect": [
                        705,
                        615,
                        230,
                        22
                    ],
                    "text": "prepend param rhythm.tempo_min"
                }
            },
            {
                "box": {
                    "id": "obj-143",
                    "maxclass": "comment",
                    "patching_rect": [
                        470,
                        647,
                        150,
                        20
                    ],
                    "text": "tempo max"
                }
            },
            {
                "box": {
                    "id": "obj-144",
                    "maxclass": "flonum",
                    "patching_rect": [
                        625,
                        645,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-145",
                    "maxclass": "newobj",
                    "patching_rect": [
                        705,
                        645,
                        230,
                        22
                    ],
                    "text": "prepend param rhythm.tempo_max"
                }
            },
            {
                "box": {
                    "id": "obj-146",
                    "maxclass": "comment",
                    "patching_rect": [
                        470,
                        677,
                        150,
                        20
                    ],
                    "text": "randomness"
                }
            },
            {
                "box": {
                    "id": "obj-147",
                    "maxclass": "flonum",
                    "patching_rect": [
                        625,
                        675,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-148",
                    "maxclass": "newobj",
                    "patching_rect": [
                        705,
                        675,
                        230,
                        22
                    ],
                    "text": "prepend param generation.randomness"
                }
            },
            {
                "box": {
                    "id": "obj-149",
                    "maxclass": "comment",
                    "patching_rect": [
                        470,
                        707,
                        150,
                        20
                    ],
                    "text": "variation amount"
                }
            },
            {
                "box": {
                    "id": "obj-150",
                    "maxclass": "flonum",
                    "patching_rect": [
                        625,
                        705,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-151",
                    "maxclass": "newobj",
                    "patching_rect": [
                        705,
                        705,
                        230,
                        22
                    ],
                    "text": "prepend param generation.variation_amount"
                }
            },
            {
                "box": {
                    "id": "obj-152",
                    "maxclass": "comment",
                    "patching_rect": [
                        470,
                        737,
                        150,
                        20
                    ],
                    "text": "mutation rate"
                }
            },
            {
                "box": {
                    "id": "obj-153",
                    "maxclass": "flonum",
                    "patching_rect": [
                        625,
                        735,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-154",
                    "maxclass": "newobj",
                    "patching_rect": [
                        705,
                        735,
                        230,
                        22
                    ],
                    "text": "prepend param generation.mutation_rate"
                }
            },
            {
                "box": {
                    "id": "obj-155",
                    "maxclass": "comment",
                    "patching_rect": [
                        470,
                        767,
                        150,
                        20
                    ],
                    "text": "sections enabled"
                }
            },
            {
                "box": {
                    "id": "obj-156",
                    "maxclass": "toggle",
                    "patching_rect": [
                        625,
                        765,
                        22,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-157",
                    "maxclass": "newobj",
                    "patching_rect": [
                        660,
                        765,
                        300,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js bool_param structure.sections_enabled"
                }
            },
            {
                "box": {
                    "id": "obj-158",
                    "maxclass": "comment",
                    "patching_rect": [
                        470,
                        797,
                        150,
                        20
                    ],
                    "text": "density min"
                }
            },
            {
                "box": {
                    "id": "obj-159",
                    "maxclass": "flonum",
                    "patching_rect": [
                        625,
                        795,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-160",
                    "maxclass": "newobj",
                    "patching_rect": [
                        705,
                        795,
                        230,
                        22
                    ],
                    "text": "prepend param density.density_min"
                }
            },
            {
                "box": {
                    "id": "obj-161",
                    "maxclass": "comment",
                    "patching_rect": [
                        470,
                        827,
                        150,
                        20
                    ],
                    "text": "density max"
                }
            },
            {
                "box": {
                    "id": "obj-162",
                    "maxclass": "flonum",
                    "patching_rect": [
                        625,
                        825,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-163",
                    "maxclass": "newobj",
                    "patching_rect": [
                        705,
                        825,
                        230,
                        22
                    ],
                    "text": "prepend param density.density_max"
                }
            },
            {
                "box": {
                    "id": "obj-164",
                    "maxclass": "comment",
                    "patching_rect": [
                        890,
                        617,
                        150,
                        20
                    ],
                    "text": "max polyphony"
                }
            },
            {
                "box": {
                    "id": "obj-165",
                    "maxclass": "number",
                    "patching_rect": [
                        1045,
                        615,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-166",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1125,
                        615,
                        230,
                        22
                    ],
                    "text": "prepend param density.max_polyphony"
                }
            },
            {
                "box": {
                    "id": "obj-167",
                    "maxclass": "comment",
                    "patching_rect": [
                        890,
                        647,
                        150,
                        20
                    ],
                    "text": "MIDI channel"
                }
            },
            {
                "box": {
                    "id": "obj-168",
                    "maxclass": "number",
                    "patching_rect": [
                        1045,
                        645,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-169",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1125,
                        645,
                        230,
                        22
                    ],
                    "text": "prepend param midi.midi_channel"
                }
            },
            {
                "box": {
                    "id": "obj-170",
                    "maxclass": "comment",
                    "patching_rect": [
                        890,
                        677,
                        150,
                        20
                    ],
                    "text": "velocity min"
                }
            },
            {
                "box": {
                    "id": "obj-171",
                    "maxclass": "number",
                    "patching_rect": [
                        1045,
                        675,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-172",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1125,
                        675,
                        230,
                        22
                    ],
                    "text": "prepend param midi.velocity_min"
                }
            },
            {
                "box": {
                    "id": "obj-173",
                    "maxclass": "comment",
                    "patching_rect": [
                        890,
                        707,
                        150,
                        20
                    ],
                    "text": "velocity max"
                }
            },
            {
                "box": {
                    "id": "obj-174",
                    "maxclass": "number",
                    "patching_rect": [
                        1045,
                        705,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-175",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1125,
                        705,
                        230,
                        22
                    ],
                    "text": "prepend param midi.velocity_max"
                }
            },
            {
                "box": {
                    "id": "obj-176",
                    "maxclass": "comment",
                    "patching_rect": [
                        890,
                        737,
                        150,
                        20
                    ],
                    "text": "octave min"
                }
            },
            {
                "box": {
                    "id": "obj-177",
                    "maxclass": "number",
                    "patching_rect": [
                        1045,
                        735,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-178",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1125,
                        735,
                        230,
                        22
                    ],
                    "text": "prepend param midi.octave_min"
                }
            },
            {
                "box": {
                    "id": "obj-179",
                    "maxclass": "comment",
                    "patching_rect": [
                        890,
                        767,
                        150,
                        20
                    ],
                    "text": "octave max"
                }
            },
            {
                "box": {
                    "id": "obj-180",
                    "maxclass": "number",
                    "patching_rect": [
                        1045,
                        765,
                        70,
                        22
                    ]
                }
            },
            {
                "box": {
                    "id": "obj-181",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1125,
                        765,
                        230,
                        22
                    ],
                    "text": "prepend param midi.octave_max"
                }
            },
            {
                "box": {
                    "id": "obj-182",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        482,
                        180,
                        20
                    ],
                    "text": "Transport and MIDI"
                }
            },
            {
                "box": {
                    "id": "obj-183",
                    "maxclass": "message",
                    "patching_rect": [
                        1330,
                        515,
                        60,
                        22
                    ],
                    "text": "panic"
                }
            },
            {
                "box": {
                    "id": "obj-184",
                    "maxclass": "message",
                    "patching_rect": [
                        1400,
                        515,
                        55,
                        22
                    ],
                    "text": "stop"
                }
            },
            {
                "box": {
                    "id": "obj-185",
                    "maxclass": "message",
                    "patching_rect": [
                        1465,
                        515,
                        55,
                        22
                    ],
                    "text": "start"
                }
            },
            {
                "box": {
                    "id": "obj-186",
                    "maxclass": "message",
                    "patching_rect": [
                        1530,
                        515,
                        60,
                        22
                    ],
                    "text": "reset"
                }
            },
            {
                "box": {
                    "id": "obj-187",
                    "maxclass": "message",
                    "patching_rect": [
                        1600,
                        515,
                        65,
                        22
                    ],
                    "text": "step 1"
                }
            },
            {
                "box": {
                    "id": "obj-188",
                    "maxclass": "message",
                    "patching_rect": [
                        1330,
                        552,
                        95,
                        22
                    ],
                    "text": "auto_step 1"
                }
            },
            {
                "box": {
                    "id": "obj-189",
                    "maxclass": "message",
                    "patching_rect": [
                        1435,
                        552,
                        95,
                        22
                    ],
                    "text": "step_count 1"
                }
            },
            {
                "box": {
                    "id": "obj-190",
                    "maxclass": "message",
                    "patching_rect": [
                        1330,
                        592,
                        300,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-191",
                    "maxclass": "comment",
                    "patching_rect": [
                        1640,
                        594,
                        100,
                        20
                    ],
                    "text": "raw MIDI bytes"
                }
            },
            {
                "box": {
                    "id": "obj-192",
                    "maxclass": "message",
                    "patching_rect": [
                        1330,
                        622,
                        300,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-193",
                    "maxclass": "comment",
                    "patching_rect": [
                        1640,
                        624,
                        80,
                        20
                    ],
                    "text": "MIDI event"
                }
            },
            {
                "box": {
                    "id": "obj-194",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1330,
                        660,
                        70,
                        22
                    ],
                    "text": "midiout"
                }
            },
            {
                "box": {
                    "id": "obj-195",
                    "maxclass": "comment",
                    "patching_rect": [
                        1410,
                        662,
                        175,
                        20
                    ],
                    "text": "optional hardware MIDI out"
                }
            },
            {
                "box": {
                    "id": "obj-196",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        752,
                        150,
                        20
                    ],
                    "text": "Diagnostics"
                }
            },
            {
                "box": {
                    "id": "obj-197",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1330,
                        782,
                        330,
                        22
                    ],
                    "text": "js sfs.layer_abc.deterministic_midi.ui.js diagnostics_monitor"
                }
            },
            {
                "box": {
                    "id": "obj-198",
                    "maxclass": "message",
                    "patching_rect": [
                        1330,
                        815,
                        330,
                        22
                    ],
                    "text": "-"
                }
            },
            {
                "box": {
                    "id": "obj-199",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        850,
                        340,
                        36
                    ],
                    "text": "Layer diagnostics and config messages stay local; primary Layer C outputs are public sends.",
                    "linecount": 2
                }
            },
            {
                "box": {
                    "id": "obj-200",
                    "maxclass": "comment",
                    "patching_rect": [
                        1330,
                        892,
                        340,
                        20
                    ],
                    "text": "Downstream patches can use receive objects with the send names shown below."
                }
            },
            {
                "box": {
                    "id": "obj-201",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1330,
                        925,
                        330,
                        22
                    ],
                    "text": "send sfs.layer_c.deterministic_midi.conductor_context"
                }
            },
            {
                "box": {
                    "id": "obj-202",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1330,
                        950,
                        330,
                        22
                    ],
                    "text": "send sfs.layer_c.deterministic_midi.harmony_context"
                }
            },
            {
                "box": {
                    "id": "obj-203",
                    "maxclass": "newobj",
                    "patching_rect": [
                        30,
                        950,
                        300,
                        22
                    ],
                    "text": "send sfs.layer_c.deterministic_midi.note_event"
                }
            },
            {
                "box": {
                    "id": "obj-204",
                    "maxclass": "newobj",
                    "patching_rect": [
                        350,
                        950,
                        300,
                        22
                    ],
                    "text": "send sfs.layer_c.deterministic_midi.midi_event"
                }
            },
            {
                "box": {
                    "id": "obj-205",
                    "maxclass": "newobj",
                    "patching_rect": [
                        670,
                        950,
                        300,
                        22
                    ],
                    "text": "send sfs.layer_c.deterministic_midi.raw_midi"
                }
            },
            {
                "box": {
                    "id": "obj-206",
                    "maxclass": "newobj",
                    "patching_rect": [
                        780,
                        610,
                        70,
                        22
                    ],
                    "text": "loadbang"
                }
            },
            {
                "box": {
                    "id": "obj-207",
                    "maxclass": "message",
                    "patching_rect": [
                        860,
                        610,
                        35,
                        22
                    ],
                    "text": "1"
                }
            },
            {
                "box": {
                    "id": "obj-208",
                    "maxclass": "message",
                    "patching_rect": [
                        905,
                        610,
                        95,
                        22
                    ],
                    "text": "sample_step 4"
                }
            },
            {
                "box": {
                    "id": "obj-209",
                    "maxclass": "message",
                    "patching_rect": [
                        1010,
                        610,
                        130,
                        22
                    ],
                    "text": "cut_threshold 0.35"
                }
            },
            {
                "box": {
                    "id": "obj-210",
                    "maxclass": "message",
                    "patching_rect": [
                        1150,
                        610,
                        60,
                        22
                    ],
                    "text": "fps 30"
                }
            },
            {
                "box": {
                    "id": "obj-211",
                    "maxclass": "message",
                    "patching_rect": [
                        780,
                        645,
                        140,
                        22
                    ],
                    "text": "smoothing_alpha 0.75"
                }
            },
            {
                "box": {
                    "id": "obj-212",
                    "maxclass": "message",
                    "patching_rect": [
                        930,
                        645,
                        125,
                        22
                    ],
                    "text": "state_inertia 0.1"
                }
            },
            {
                "box": {
                    "id": "obj-213",
                    "maxclass": "newobj",
                    "patching_rect": [
                        1070,
                        645,
                        80,
                        22
                    ],
                    "text": "delay 250"
                }
            },
            {
                "box": {
                    "id": "obj-214",
                    "maxclass": "message",
                    "patching_rect": [
                        1160,
                        645,
                        110,
                        22
                    ],
                    "text": "publish_config"
                }
            },
            {
                "box": {
                    "id": "obj-215",
                    "maxclass": "message",
                    "patching_rect": [
                        360,
                        190,
                        125,
                        22
                    ],
                    "text": "source_type movie"
                }
            },
            {
                "box": {
                    "id": "obj-216",
                    "maxclass": "message",
                    "patching_rect": [
                        360,
                        215,
                        130,
                        22
                    ],
                    "text": "source_name movie"
                }
            },
            {
                "box": {
                    "id": "obj-217",
                    "maxclass": "message",
                    "patching_rect": [
                        360,
                        240,
                        130,
                        22
                    ],
                    "text": "source_type camera"
                }
            },
            {
                "box": {
                    "id": "obj-218",
                    "maxclass": "message",
                    "patching_rect": [
                        360,
                        265,
                        135,
                        22
                    ],
                    "text": "source_name camera"
                }
            },
            {
                "box": {
                    "id": "obj-219",
                    "maxclass": "message",
                    "patching_rect": [
                        470,
                        154,
                        55,
                        22
                    ],
                    "text": "reset"
                }
            }
        ],
        "lines": [
            {
                "patchline": {
                    "source": [
                        "obj-116",
                        0
                    ],
                    "destination": [
                        "obj-117",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-117",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-119",
                        0
                    ],
                    "destination": [
                        "obj-120",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-120",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-122",
                        0
                    ],
                    "destination": [
                        "obj-123",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-123",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-124",
                        0
                    ],
                    "destination": [
                        "obj-126",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-126",
                        0
                    ],
                    "destination": [
                        "obj-127",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-127",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-129",
                        0
                    ],
                    "destination": [
                        "obj-130",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-130",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-132",
                        1
                    ],
                    "destination": [
                        "obj-133",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-133",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-135",
                        0
                    ],
                    "destination": [
                        "obj-136",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-136",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-138",
                        0
                    ],
                    "destination": [
                        "obj-139",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-139",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-141",
                        0
                    ],
                    "destination": [
                        "obj-142",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-142",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-144",
                        0
                    ],
                    "destination": [
                        "obj-145",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-145",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-147",
                        0
                    ],
                    "destination": [
                        "obj-148",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-148",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-150",
                        0
                    ],
                    "destination": [
                        "obj-151",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-151",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-153",
                        0
                    ],
                    "destination": [
                        "obj-154",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-154",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-156",
                        0
                    ],
                    "destination": [
                        "obj-157",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-157",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-159",
                        0
                    ],
                    "destination": [
                        "obj-160",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-160",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-162",
                        0
                    ],
                    "destination": [
                        "obj-163",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-163",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-165",
                        0
                    ],
                    "destination": [
                        "obj-166",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-166",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-168",
                        0
                    ],
                    "destination": [
                        "obj-169",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-169",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-171",
                        0
                    ],
                    "destination": [
                        "obj-172",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-172",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-174",
                        0
                    ],
                    "destination": [
                        "obj-175",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-175",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-177",
                        0
                    ],
                    "destination": [
                        "obj-178",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-178",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-180",
                        0
                    ],
                    "destination": [
                        "obj-181",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-181",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-11",
                        0
                    ],
                    "destination": [
                        "obj-13",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-11",
                        0
                    ],
                    "destination": [
                        "obj-14",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-13",
                        0
                    ],
                    "destination": [
                        "obj-29",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-14",
                        0
                    ],
                    "destination": [
                        "obj-32",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-21",
                        0
                    ],
                    "destination": [
                        "obj-30",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-21",
                        0
                    ],
                    "destination": [
                        "obj-29",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-21",
                        0
                    ],
                    "destination": [
                        "obj-215",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-21",
                        0
                    ],
                    "destination": [
                        "obj-216",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-21",
                        0
                    ],
                    "destination": [
                        "obj-219",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-30",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-29",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-217",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-218",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-23",
                        0
                    ],
                    "destination": [
                        "obj-219",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-16",
                        0
                    ],
                    "destination": [
                        "obj-27",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-16",
                        0
                    ],
                    "destination": [
                        "obj-21",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-17",
                        0
                    ],
                    "destination": [
                        "obj-27",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-18",
                        0
                    ],
                    "destination": [
                        "obj-27",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-19",
                        0
                    ],
                    "destination": [
                        "obj-27",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-19",
                        0
                    ],
                    "destination": [
                        "obj-219",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-25",
                        0
                    ],
                    "destination": [
                        "obj-28",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-25",
                        0
                    ],
                    "destination": [
                        "obj-23",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-26",
                        0
                    ],
                    "destination": [
                        "obj-28",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-27",
                        0
                    ],
                    "destination": [
                        "obj-30",
                        1
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-28",
                        0
                    ],
                    "destination": [
                        "obj-30",
                        2
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-29",
                        0
                    ],
                    "destination": [
                        "obj-27",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-29",
                        1
                    ],
                    "destination": [
                        "obj-28",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-30",
                        0
                    ],
                    "destination": [
                        "obj-31",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-30",
                        0
                    ],
                    "destination": [
                        "obj-32",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-32",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-215",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-216",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-217",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-218",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-219",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-219",
                        0
                    ],
                    "destination": [
                        "obj-52",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-219",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-208",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-209",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-210",
                        0
                    ],
                    "destination": [
                        "obj-35",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-211",
                        0
                    ],
                    "destination": [
                        "obj-52",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-212",
                        0
                    ],
                    "destination": [
                        "obj-52",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-35",
                        0
                    ],
                    "destination": [
                        "obj-36",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-35",
                        0
                    ],
                    "destination": [
                        "obj-52",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-35",
                        1
                    ],
                    "destination": [
                        "obj-197",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-36",
                        0
                    ],
                    "destination": [
                        "obj-37",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-36",
                        1
                    ],
                    "destination": [
                        "obj-39",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-36",
                        2
                    ],
                    "destination": [
                        "obj-41",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-36",
                        3
                    ],
                    "destination": [
                        "obj-43",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-36",
                        4
                    ],
                    "destination": [
                        "obj-45",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-36",
                        5
                    ],
                    "destination": [
                        "obj-47",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-36",
                        6
                    ],
                    "destination": [
                        "obj-49",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-52",
                        0
                    ],
                    "destination": [
                        "obj-53",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-52",
                        0
                    ],
                    "destination": [
                        "obj-82",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-52",
                        1
                    ],
                    "destination": [
                        "obj-197",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        0
                    ],
                    "destination": [
                        "obj-54",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        1
                    ],
                    "destination": [
                        "obj-55",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        2
                    ],
                    "destination": [
                        "obj-57",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        3
                    ],
                    "destination": [
                        "obj-59",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        4
                    ],
                    "destination": [
                        "obj-61",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        5
                    ],
                    "destination": [
                        "obj-63",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        6
                    ],
                    "destination": [
                        "obj-65",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        7
                    ],
                    "destination": [
                        "obj-67",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        8
                    ],
                    "destination": [
                        "obj-69",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        9
                    ],
                    "destination": [
                        "obj-71",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        10
                    ],
                    "destination": [
                        "obj-73",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        11
                    ],
                    "destination": [
                        "obj-75",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        12
                    ],
                    "destination": [
                        "obj-77",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-53",
                        13
                    ],
                    "destination": [
                        "obj-79",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-82",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-82",
                        1
                    ],
                    "destination": [
                        "obj-197",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        0
                    ],
                    "destination": [
                        "obj-84",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        0
                    ],
                    "destination": [
                        "obj-201",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        1
                    ],
                    "destination": [
                        "obj-84",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        1
                    ],
                    "destination": [
                        "obj-202",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        2
                    ],
                    "destination": [
                        "obj-84",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        2
                    ],
                    "destination": [
                        "obj-203",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        3
                    ],
                    "destination": [
                        "obj-84",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        3
                    ],
                    "destination": [
                        "obj-204",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        4
                    ],
                    "destination": [
                        "obj-84",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        4
                    ],
                    "destination": [
                        "obj-205",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        4
                    ],
                    "destination": [
                        "obj-194",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        5
                    ],
                    "destination": [
                        "obj-110",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-83",
                        5
                    ],
                    "destination": [
                        "obj-197",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        0
                    ],
                    "destination": [
                        "obj-85",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        1
                    ],
                    "destination": [
                        "obj-87",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        2
                    ],
                    "destination": [
                        "obj-89",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        3
                    ],
                    "destination": [
                        "obj-91",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        4
                    ],
                    "destination": [
                        "obj-93",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        5
                    ],
                    "destination": [
                        "obj-95",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        6
                    ],
                    "destination": [
                        "obj-97",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        7
                    ],
                    "destination": [
                        "obj-99",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        8
                    ],
                    "destination": [
                        "obj-101",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        9
                    ],
                    "destination": [
                        "obj-103",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        10
                    ],
                    "destination": [
                        "obj-105",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        13
                    ],
                    "destination": [
                        "obj-107",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        16
                    ],
                    "destination": [
                        "obj-192",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-84",
                        17
                    ],
                    "destination": [
                        "obj-190",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        0
                    ],
                    "destination": [
                        "obj-111",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        1
                    ],
                    "destination": [
                        "obj-116",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        2
                    ],
                    "destination": [
                        "obj-119",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        3
                    ],
                    "destination": [
                        "obj-122",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        4
                    ],
                    "destination": [
                        "obj-129",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        5
                    ],
                    "destination": [
                        "obj-132",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        6
                    ],
                    "destination": [
                        "obj-135",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        7
                    ],
                    "destination": [
                        "obj-138",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        8
                    ],
                    "destination": [
                        "obj-141",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        9
                    ],
                    "destination": [
                        "obj-144",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        10
                    ],
                    "destination": [
                        "obj-147",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        11
                    ],
                    "destination": [
                        "obj-150",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        12
                    ],
                    "destination": [
                        "obj-153",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        13
                    ],
                    "destination": [
                        "obj-156",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        14
                    ],
                    "destination": [
                        "obj-159",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        15
                    ],
                    "destination": [
                        "obj-162",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        16
                    ],
                    "destination": [
                        "obj-165",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        17
                    ],
                    "destination": [
                        "obj-168",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        18
                    ],
                    "destination": [
                        "obj-171",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        19
                    ],
                    "destination": [
                        "obj-174",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        20
                    ],
                    "destination": [
                        "obj-177",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        21
                    ],
                    "destination": [
                        "obj-180",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-110",
                        22
                    ],
                    "destination": [
                        "obj-198",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-183",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-184",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-185",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-186",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-187",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-112",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-113",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-188",
                        0
                    ],
                    "destination": [
                        "obj-82",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-189",
                        0
                    ],
                    "destination": [
                        "obj-82",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-197",
                        0
                    ],
                    "destination": [
                        "obj-198",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-207",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-208",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-209",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-210",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-211",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-212",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-188",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-189",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-206",
                        0
                    ],
                    "destination": [
                        "obj-213",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-207",
                        0
                    ],
                    "destination": [
                        "obj-21",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-213",
                        0
                    ],
                    "destination": [
                        "obj-214",
                        0
                    ]
                }
            },
            {
                "patchline": {
                    "source": [
                        "obj-214",
                        0
                    ],
                    "destination": [
                        "obj-83",
                        0
                    ]
                }
            }
        ]
    }
}
