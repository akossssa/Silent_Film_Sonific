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
        "rect": [120.0, 120.0, 520.0, 260.0],
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
        "description": "Structured file logger for Silent Film Sonific patches",
        "digest": "",
        "tags": "sfs,debug,logger",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "SFS Debug Logger",
                    "patching_rect": [35.0, 25.0, 180.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Input: log level event message..., dictionary <name>, or configuration messages.",
                    "patching_rect": [35.0, 50.0, 430.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "inlet",
                    "comment": "diagnostics / dictionaries",
                    "patching_rect": [60.0, 100.0, 30.0, 30.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "text": "js sfs.debug.logger.js #1",
                    "patching_rect": [60.0, 150.0, 175.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "outlet",
                    "comment": "logger status",
                    "patching_rect": [60.0, 200.0, 30.0, 30.0]
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
                    "destination": ["obj-5", 0]
                }
            }
        ]
    }
}
