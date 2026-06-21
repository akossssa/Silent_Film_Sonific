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
        "rect": [120.0, 120.0, 860.0, 470.0],
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
        "description": "Layer A to Layer B integration self-test",
        "digest": "",
        "tags": "sfs,test,integration,video,interpretation",
        "style": "",
        "subpatcher_template": "",
        "assistshowspatchername": 0,
        "boxes": [
            {
                "box": {
                    "id": "obj-1",
                    "maxclass": "comment",
                    "text": "Layer A -> Layer B Integration Self-Test",
                    "patching_rect": [35.0, 25.0, 340.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-2",
                    "maxclass": "comment",
                    "text": "Generated matrices -> production Layer A -> production Layer B -> integration assertions.",
                    "patching_rect": [35.0, 55.0, 650.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-3",
                    "maxclass": "newobj",
                    "text": "loadbang",
                    "patching_rect": [35.0, 115.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-4",
                    "maxclass": "message",
                    "text": "start",
                    "patching_rect": [35.0, 155.0, 50.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-5",
                    "maxclass": "newobj",
                    "text": "js sfs.layer_ab.integration.selftest_driver.js",
                    "patching_rect": [160.0, 155.0, 325.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-6",
                    "maxclass": "newobj",
                    "text": "js D:/tmp/sfs_project/patchers/sfs.video_analysis.basic_motion.js",
                    "patching_rect": [160.0, 225.0, 430.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-7",
                    "maxclass": "newobj",
                    "text": "js D:/tmp/sfs_project/patchers/sfs.interpretation.state_machine.js",
                    "patching_rect": [160.0, 295.0, 455.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-8",
                    "maxclass": "newobj",
                    "text": "print sfs.layer_ab.integration",
                    "patching_rect": [520.0, 155.0, 205.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-9",
                    "maxclass": "comment",
                    "text": "Report: logs/tests/layer_ab_integration.latest.json",
                    "patching_rect": [35.0, 380.0, 360.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-10",
                    "maxclass": "comment",
                    "text": "Append log: logs/tests/layer_ab_integration.jsonl",
                    "patching_rect": [35.0, 405.0, 340.0, 20.0]
                }
            },
            {
                "box": {
                    "id": "obj-11",
                    "maxclass": "newobj",
                    "text": "delay 3000",
                    "patching_rect": [35.0, 205.0, 75.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-12",
                    "maxclass": "message",
                    "text": "write \"D:/tmp/sfs_project/logs/max/sfs-max-console.txt\"",
                    "patching_rect": [35.0, 245.0, 340.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-13",
                    "maxclass": "newobj",
                    "numinlets": 1,
                    "numoutlets": 3,
                    "text": "console",
                    "patching_rect": [35.0, 285.0, 60.0, 22.0]
                }
            },
            {
                "box": {
                    "id": "obj-14",
                    "maxclass": "comment",
                    "text": "Auto-exports Max Console after self-test load.",
                    "patching_rect": [105.0, 285.0, 280.0, 20.0]
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
                    "source": ["obj-4", 0],
                    "destination": ["obj-5", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-5", 0],
                    "destination": ["obj-6", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-5", 1],
                    "destination": ["obj-8", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-6", 0],
                    "destination": ["obj-7", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-6", 0],
                    "destination": ["obj-5", 1]
                }
            },
            {
                "patchline": {
                    "source": ["obj-7", 0],
                    "destination": ["obj-5", 2]
                }
            },
            {
                "patchline": {
                    "source": ["obj-11", 0],
                    "destination": ["obj-12", 0]
                }
            },
            {
                "patchline": {
                    "source": ["obj-12", 0],
                    "destination": ["obj-13", 0]
                }
            }
        ]
    }
}
