#!python3

import sys
import hashlib
from base64 import b64encode, b64decode
import math

prooffile = "proof.txt"    # File where Merkle proof will be written.

MAXHEIGHT = 20             # Max height of Merkle tree


class MerkleProof:
    def __init__(self, leaf, pos, path):
        self.leaf = leaf  # data of leaf being checked
        self.pos  = pos   # the position in the tree of the leaf being checked
        self.path = path  # the path of hashes, from bottom to the top of tree

# 叶子节点
def hash_leaf(leaf):
    """hash a leaf value."""
    # 创建一个 SHA-256 对象
    sha256 = hashlib.sha256()
    # sha256.update用于更新哈希值，将指定的数据追加到当前哈希值的末尾，然后更新哈希值
    sha256.update(b"leaf:")   # hash prefix for a leaf
    sha256.update(leaf)
    # 调用哈希对象的 update() 方法将使用输入消息数据更新哈希函数的内部状态，但不会立即产生最终哈希值。
    # 在调用 update() 后调用哈希对象的 digest() 方法将根据哈希函数的更新状态产生最终哈希值，从而获得消息的正确 SHA-256 哈希值
    # 返回一个 bytes 对象
    return sha256.digest()

# 非叶子节点，由它的两个孩子节点哈希二合一
def hash_internal_node(left, right):
    """hash an internal node."""
    sha256 = hashlib.sha256()
    sha256.update(b"node:")   # hash prefix for an internal node
    sha256.update(left)
    sha256.update(right)
    return sha256.digest()

##  The prefixes in the two functions above are a security measure.
##  They provide domain separation, meaning that the domain of a leaf hash
##  is seperated from the domain of an internal node hash.
##  This ensures that the verifier cannot mistake a leaf hash for 
##  an internal node hash, and vice versa. 


def gen_merkle_proof(leaves, pos):
    """Takes as input a list of leaves and a leaf position (pos).
       Returns the Merkle proof for the leaf at pos."""
    """
    结合 verifier.py 中的 compute_merkle_root_from_proof 函数，应该是要把从叶子节点的哈希开始（叶子节点的哈希要加进去），
    把跟它一起构成上一层它的父节点的兄弟节点（可能在它左边/右边），加到path中，然后进入上一层，也就是它的父节点那一层，
    把父节点的兄弟节点加进去（注意不加父节点，因为它可以通过两个子节点算出来），一直循环。
    """
    # 计算 Merkle Tree 的高度
    height = math.ceil(math.log(len(leaves),2))
    assert height < MAXHEIGHT, "Too many leaves."

    # hash all the leaves
    # map() 函数的第一个参数可以是一个函数对象，这个函数对象将被应用于 map() 的第二个参数中的每个元素
    state = list(map(hash_leaf, leaves))  

    # Pad the list of hashed leaves to a power of two
    # state 列表末尾添加 padlen个字节的 \x00（空字节），以确保 state 列表的长度是 2^height 的形式
    padlen = (2**height)-len(leaves)
    state += [b"\x00"] * padlen

    # initialize a list that will contain the hashes in the proof
    path = []
    # 叶子节点的哈希值
    # path.append(state[pos])
    if pos % 2 == 0:
        path.append(state[pos+1])
    if pos % 2 == 1:
        path.append(state[pos-1])
    level_pos = pos    # local copy of pos
    last_level_list = state
    # print("state len",len(state))
    # 注意，这个长度要用 state 的，不能用 leaves 的，因为 state 填充过，它的长度是2的整数次幂
    this_level_len = len(state)
    for level in range(height):
        """
        from chatgpt but it doesn't work
        # 获取当前节点的索引
        index = pos >> level

        # 如果索引是偶数，则右兄弟是下一个节点，否则左兄弟是下一个节点
        if index % 2 == 0:
            sibling_index = index + 1
        else:
            sibling_index = index - 1

        # 如果节点没有兄弟，则使用自身哈希填充列表
        if sibling_index >= 2 ** level + len(leaves):
            sibling_hash = state[-1]
        else:
            sibling_hash = state[sibling_index]

        # 将兄弟哈希添加到证明路径中
        path.append(sibling_hash)
        """
        tmp_list = []
        print("level-", level, "-----")
        # 对前面一行计算哈希
        for i in range(0, this_level_len - 1, 2):
            # print(i)
            if level_pos % 2 == 0 and level_pos == i:
                # path.append(last_level_list[level_pos])
                print("@@@one", level_pos)
                path.append(last_level_list[level_pos + 1])
            if  level_pos % 2 == 1 and level_pos == i - 1:
                # path.append(last_level_list[level_pos])
                print("@@@two", level_pos)
                path.append(last_level_list[level_pos - 1])

            tmp_list.append(hash_internal_node(last_level_list[i], last_level_list[i+1]))
        last_level_list = tmp_list

        print(len(tmp_list))
        print("choosed",level_pos//2)
        # 加入路径
        # path.append(tmp_list[level_pos//2])
        # print("now the path is",path)
        level_pos = level_pos//2
        this_level_len = this_level_len//2

#######  YOUR CODE GOES HERE                              ######
#######     to hash internal nodes in the tree use the    ######
#######     function hash_internal_node(left,right)       ######

    # return a list of hashes that makes up the Merkle proof
    print("the len of path is", len(path))
    # print(path[-1])
    return path


### Helper function
def write_proof(filename, proof:MerkleProof):
    fp = open(filename, "w")
    # 用 print 函数将证明对象中的信息写入到文件 fp 中
    # 叶子节点的位置
    print("leaf position: {pos:d}".format(pos=proof.pos), file=fp)
    # 叶子节点的值
    print("leaf value: \"{leaf:s}\"".format(leaf=proof.leaf.decode('utf-8')), file=fp)
    # 写入证明路径中的哈希值
    print("Hash values in proof:", file=fp)
    # 对于每个哈希值，函数将其转换为 Base64 编码字符串
    for i in range(len(proof.path)):
        print("  {:s}".format(b64encode(proof.path[i]).decode('utf-8')), file=fp)
    fp.close()



### Main program
if __name__ == "__main__":

    # Generate 1000 leaves
    leaves = [b"data item " + str(i).encode() for i in range(1000)]
    # print("the leaves are",leaves)
    print('\nI generated 1000 leaves for a Merkle tree of height 10.')

    # Generate proof for leaf #743
    pos = 743
    path  = gen_merkle_proof(leaves, pos)
    proof = MerkleProof(leaves[pos], pos, path)

    # write proof to file
    write_proof(prooffile, proof)

    print('I generated a Merkle proof for leaf #{} in file {}\n'.format(pos,prooffile))
    sys.exit(0)



