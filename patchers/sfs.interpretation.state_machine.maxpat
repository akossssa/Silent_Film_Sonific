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
        "rect": [100.0, 100.0, 760.0, 320.0],
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
        "description": "Layer B deterministic state-machine interpretation for Silent Film Sonific",
        "digest": "",
        "tags": "sfs,interpretation,state-machine",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "Layer B: State-Machine Interpretation",
                    "patching_rect": [35.0, 25.0, 300.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Input: dictionary sfs_video_features plus optional messages: reset, smoothing_alpha, state_inertia",
                    "linecount": 2,
                    "patching_rect": [35.0, 50.0, 620.0, 36.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "inlet",
                    "comment": "SFS_VIDEO_FEATURES dictionary / config",
                    "patching_rect": [65.0, 120.0, 30.0, 30.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "text": "js sfs.interpretation.state_machine.js",
                    "patching_rect": [65.0, 170.0, 255.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "outlet",
                    "comment": "dictionary sfs_musical_control",
                    "patching_rect": [65.0, 235.0, 30.0, 30.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "comment",
                    "text": "Output: dictionary sfs_musical_control using SFS_MUSICAL_CONTROL v0.1.0",
                    "patching_rect": [115.0, 239.0, 465.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "outlet",
                    "comment": "diagnostics",
                    "patching_rect": [350.0, 235.0, 30.0, 30.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "comment",
                    "text": "Diagnostics output for optional devtools logging",
                    "patching_rect": [400.0, 239.0, 285.0, 20.0]
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
            },
            {
                "patchline": {
                    "source": ["obj-4", 1],
                    "destination": ["obj-7", 0]
                }
            }
        ]
    }
}
