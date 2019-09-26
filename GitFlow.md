
# 分支说明

Master分支，这个分支包含最近发布到生成环境的代码，并通过Tag进行标注Release版本号，这个分支只能从其他分支合并，不能在这个分支直接修改。

Develop分支，这个分支是我们的主开发分支，包含所有要发布到下一个Release的代码，这个分支只能从其他分支合并，不能在这个分支直接修改。

Feature分支，这个分支主要是用来开发一个新的功能，基于Develop分支创建，一旦开发完成，就会将其合并回Develop分支，并将其删除。

Release分支，预发布分支，当你需要发布的时候，基于Develop分支创建一个Release分支，允许小修复和最终版本元数据（版本号等）修改，从Develop分支到Release分支的关键点是开发完成反映新版本的期望状态。至少合并了所有针对要发布的功能，针对未来版本的所有功能不会被合并-他们必须等到Release分支创建完成后才可以被合并。完成Release后，将其合并到Master分支（需要打Tag）和Develop分支，并将其删除。上线前最后的测试将在这个分支进行。

Hotfix分支，当我们在Master分支发现Bug的时候，需要基于Master分支创建一个Hotfix分支，完成Hotfix后，将其合并到Master分支（当做一个新的Release）和Develop分支，并将其删除。

# 分支命名规范

Master分支和Develop分支固定为“master”和“develop”；

Feature分支以“feature/”作为前缀，名称为功能的英文，多个单词用连接符“-”进行连接，例如：feature/my-feature，feature/user-login等；

Release分支以版本号作为分支名，由项目负责人指定，例如：Odyssey-v3.1.3，3.1.3等；

Hotfix分支以“hotfix/”作为前缀，名称为Bug简单描述，多个单词用连接符“-”进行连接，例如：hotfix/typo，hotfix/null-point-exception等；