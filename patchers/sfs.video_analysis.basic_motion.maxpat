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
        "rect": [100.0, 100.0, 720.0, 300.0],
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
        "description": "Layer A basic video feature extractor for Silent Film Sonific",
        "digest": "",
        "tags": "sfs,video,analysis",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "Layer A: Basic Motion Analysis",
                    "patching_rect": [35.0, 25.0, 250.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Input: jit_matrix plus optional metadata messages: source_type, source_name, fps, frame, sample_step, cut_threshold, reset",
                    "linecount": 2,
                    "patching_rect": [35.0, 50.0, 570.0, 36.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "inlet",
                    "comment": "jit_matrix / metadata",
                    "patching_rect": [65.0, 115.0, 30.0, 30.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "newobj",
                    "text": "js sfs.video_analysis.basic_motion.js",
                    "patching_rect": [65.0, 165.0, 245.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "outlet",
                    "comment": "dictionary sfs_video_features",
                    "patching_rect": [65.0, 220.0, 30.0, 30.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "comment",
                    "text": "Output: dictionary sfs_video_features using SFS_VIDEO_FEATURES v0.1.0",
                    "patching_rect": [115.0, 224.0, 430.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "outlet",
                    "comment": "diagnostics",
                    "patching_rect": [335.0, 220.0, 30.0, 30.0]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "comment",
                    "text": "Diagnostics output for optional devtools logging",
                    "patching_rect": [385.0, 224.0, 285.0, 20.0]
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
                    "destination": ["obj-8", 0]
                }
            }
        ]
    }
}
